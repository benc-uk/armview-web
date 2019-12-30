acquireVsCodeApi = function() {
  return {
    postMessage(msg) {
      window.postMessage(msg, "*");
    }
  }
}

//
// This replaces exportPNG function in extension: main.js
// and savePNG in extension.js
//
function exportPNGWrapper() {
  let blob = cy.png({ scale: 2.0, output: 'blob' });  
  saveAs(blob, "arm-template.png")
}

//
// This replaces pickFilters function in extension.js
//
// Has to be after main.js
function setFiltersWrapper() {
  filters = prompt("Resource types to filter out, as a comma separated list", filters);
  document.getElementById('statusFilters').innerHTML = filters
  if(filters === "") document.getElementById('statusFilters').innerHTML = "none"
  displayData(data);
}

//
// Test if we're in an iframe
//
function inIframe () {
  try {
      return window.self !== window.top;
  } catch (e) {
      return true;
  }
}