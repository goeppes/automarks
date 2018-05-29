function save(e) {
  e.preventDefault();
  browser.storage.local.set({
    reversed: document.querySelector("#reversed").value
  });
}

function load() {

  function resolve(item) {
    document.querySelector("#reversed").value = item.reversed || false;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get().then(resolve, onError);
}

document.addEventListener("DOMContentLoaded", load);
document.querySelector("form").addEventListener("submit", save);
