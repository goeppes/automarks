/**
 * Keeps tracks of which folders are actively being sorted.
 */
var active = new Set();

/**
 * Builds a comparator.
 */
function buildComparator() {
  return browser.storage.local.get().then(settings => {
    let foldersMode = 1;
    let field = "title";
    //let field = "url";
    let isReversed = settings.reversed;
    let isCaseSensitive = false;
    
    function compare(a, b) {
      if (foldersMode) {
        if (a.type === "folder" && b.type === "folder") {
          let titleA = isCaseSensitive ? a.title : a.title.toLowerCase();
          let titleB = isCaseSensitive ? b.title : b.title.toLowerCase();

          if (titleA < titleB) { return -1; }
          if (titleA > titleB) { return 1; }

          return 0;
        }
        if (a.type === "folder") { return -foldersMode; }
        if (b.type === "folder") { return foldersMode; }
      }

      let fieldA = isCaseSensitive ? a[field] : a[field].toLowerCase();
      let fieldB = isCaseSensitive ? b[field] : b[field].toLowerCase();

      if (fieldA < fieldB) { return -1; }
      if (fieldA > fieldB) { return 1; }
    }

    /**
     * Comparator function for BookmarkTreeNodes. Compares a and b.
     *
     * @param a A BookmarkTreeNode object.
     * @param b A BookmarkTreeNode object.
     * @returns {integer}
     */
    return function(a, b) {
      return compare(a, b) * (isReversed ? -1 : 1);
    }
  });
}

/**
 * Sort the given entries.
 * 
 * @param {string} id String of the ID of the bookmark folder to sort. 
 */
function autosort(id) {

  function organize(entries, buildingCompare) {
    return buildingCompare.then(compare => {

      function append(contents, section) {
        section.sort(compare);
        Array.prototype.push.apply(contents, section);
        section.length = 0;
      }

      function isSorted(array) {
        for (let i = 1; i < array.length; i++) {
          if (array[i - 1].type !== "separator"
              && array[i].type !== "separator"
              && compare(array[i - 1], array[i]) > 0) {
            return false;
          }
        }
        return true;
      }

      if (isSorted(entries)) {
        console.log("is already sorted");
        return;
      }

      let contents = [];
      let section = [];

      for (let entry of entries) {
        if (entry.type === "separator") {
          append(contents, section);
          contents.push(entry);
        } else {
          section.push(entry);
        }
      }
      append(contents, section);

      let sync = Promise.resolve();
      for (let i = 0; i < contents.length; i++) {
        sync = sync.then(() => {
          return browser.bookmarks.move(contents[i].id, {index: i});
        })
        .then(bookmark => console.log(bookmark));
      }
    });
  }

  if (!active.has(id)) {
    active.add(id);
    console.log(`starting:autosort(${id})`);
    browser.bookmarks.getChildren(id)
      .then(entries => organize(entries, buildComparator()))
      .then(() => {
        console.log(`finished:autosort(${id})`)
        setTimeout(() => {
          active.delete(id);
          console.log(`prepared:autosort(${id})`)
        }, 3000)}
      );
  }
}

/**
 * Sort all bookmarks.
 */
function autosortAll() {

  function recurse(node) {
    if (node.type === "folder") {
      node.children.forEach(recurse);
      autosort(node.id);
    }
  }

  browser.bookmarks.getSubTree("menu________")
    .then(([menu]) => recurse(menu));
}

// ====
// MAIN
// ====

browser.bookmarks.onMoved.addListener((id, changeInfo) => {
  browser.bookmarks.get(id).then(([b]) => autosort(b.parentId));
})

browser.bookmarks.onCreated.addListener((id, moveInfo) => {
  autosort(moveInfo.parentId);
});

browser.bookmarks.onChanged.addListener((id, bookmark) => {
  autosort(bookmark.parentId);
});
