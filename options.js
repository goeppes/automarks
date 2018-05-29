function save(e) {
  e.preventDefault();

  let settings = {
    reversed: document.querySelector("#reversed").checked
  };

  console.log("Saving settings:");
  console.log(settings);

  browser.storage.local.set(settings);
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
