function onResolve(page) {
  document.addEventListener("click", e => {
    if (e.target.classList.contains("button")) {
      page.autosortAll();
    }
  });
}

function onError(error) {
  console.log(`Error: ${error}`);
}

browser.runtime.getBackgroundPage().then(onResolve, onError);
