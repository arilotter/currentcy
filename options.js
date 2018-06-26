function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    localCurr: document.querySelector("#localCurr").value
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#localCurr").value = result.localCurr || "EUR";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("localCurr");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
