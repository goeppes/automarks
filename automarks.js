/**
 * Compares a and b.
 *
 * @param a A BookmarkTreeNode object.
 * @param b A BookmarkTreeNode object.
 * @returns {integer}
 */
function comparator(a, b) {
  let foldersMode = 1;
  let field = "title";
  //let field = "url";
  let reverse = false;

  function folders(a, b) {
    if (a.type === "folder" && b.type === "folder") {
      if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
      if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
      return 0;
    }

    if (a.type === "folder") { return -1; }
    if (b.type === "folder") { return 1; }

    return undefined;
  }

  function compare(a, b) {
    if (foldersMode) {
      let result = folders(a, b);
      if (result !== undefined) {
        return result * foldersMode;
      }
    }

    if (a[field].toLowerCase() < b[field].toLowerCase()) { return -1; }
    if (a[field].toLowerCase() > b[field].toLowerCase()) { return 1; }

    return 0;
  }

  return compare(a, b) * (reverse ? -1 : 1);
}

/**
 * Sort the given entries.
 * 
 * @param {Array} entries Array of BookmarkTreeNode objects.
 */
function autosort(entries) {

  function append(contents, section) {
    section.sort(comparator);
    Array.prototype.push.apply(contents, section);
    section.length = 0;
  }

  function organize(entries) {
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

    return contents;
  }

  console.log("begin autosorting");

  let contents = organize(entries);
  let sync = new Promise(resolve => { resolve(null); });
  for (let i = 0; i < contents.length; i++) {
    sync = sync.then(() => {
      browser.bookmarks.move(contents[i].id, {index: i})
    }).then(resolve => {
      // do nothing?
    }, reject => {
      console.log("error");
      console.log(reject);
    });
  }

  console.log("done autosorting");
}

/**
 * Sort all bookmarks.
 */
function autosortAll() {

  function autosortNode(nodes) {
    if (typeof nodes !== "undefined") {
      for (let node of nodes) {
        console.log(node);
        if (node.type === "folder") {
          autosortNode(node.children);
        }
      }
      autosort(nodes);
    } else {
      console.log(`what is this? ${nodes}`);
    }
  }

  browser.bookmarks.getSubTree("menu________")
    .then(([menu]) => autosortNode(menu.children));
}

// Events

function handleCreated(id, bookmark) {
  console.log("create triggered!");
  browser.bookmarks.getChildren(bookmark.parentId).then(autosort);
}

function handleChanged(id, changeInfo) {
  console.log("change triggered!");
  browser.bookmarks.get(id)
    .then(([bookmark]) => browser.bookmarks.getChildren(bookmark.parentId))
    .then(autosort);
}

function handleMovedInter(id, moveInfo) {
  if (moveInfo.parentId !== moveInfo.oldParentId) {
    console.log("cross-folder move triggered!");
    browser.bookmarks.getChildren(moveInfo.parentId).then(autosort);
  }
}

function handleMovedIntra(id, moveInfo) {
  if (moveInfo.parentId === moveInfo.oldParentId) {
    console.log("same-folder move triggered!");
    browser.bookmarks.getChildren(moveInfo.parentId).then(autosort);
  }
}

autosortAll();

browser.bookmarks.onMoved.addListener(handleMovedInter);
//browser.bookmarks.onMoved.addListener(handleMovedIntra);
browser.bookmarks.onCreated.addListener(handleCreated);
browser.bookmarks.onChanged.addListener(handleChanged);
