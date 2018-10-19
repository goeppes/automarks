function save(e) {
  e.preventDefault();

  let fieldOptions = document.querySelector("#bookmarks-menu-sort-bookmarks-by");

  let settings = {
    field: fieldOptions.options[fieldOptions.selectedIndex].value,
    reversed: document.querySelector("#bookmarks-menu-bookmarks-reversed").checked,
    delay: parseInt(document.querySelector("#delay").value)
  };

  console.log("Saving settings:");
  console.log(settings);

  browser.storage.local.set(settings);
}

function load() {

  function resolve(item) {
    console.log("Loading settings:");
    console.log(item);

    let fieldOptions = document.querySelector("#bookmarks-menu-sort-bookmarks-by");
    let indices = {};
    for (let i = 0; i < fieldOptions.options.length; i++) {
      indices[fieldOptions.options[i].value] = i;
    }
    fieldOptions.selectedIndex = item.field ? indices[item.field] : 0;

    document.querySelector("#bookmarks-menu-bookmarks-reversed").checked = item.reversed || false;

    document.querySelector("#delay").value = (item.delay || "0").toString();
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get().then(resolve, onError);
}

document.addEventListener("DOMContentLoaded", load);
document.querySelector("form").addEventListener("submit", save);
