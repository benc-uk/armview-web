acquireVsCodeApi = function() {
  return {
    postMessage(msg) {
      window.postMessage(msg, "*");
    }
  }
}

//
// This replaces exportPNG function in extension main.js
//
function exportPNGWrapper() {
  let blob = cy.png({ scale: 2.0, output: 'blob' });  
  saveAs(blob, "arm-template.png")
}

//
// This replaces exportPNG in extension main.js
//
// Has to be after main.js
function setFiltersWrapper() {
  filters = prompt("Resource types to filter out, as a comma separated list", filters);
  document.getElementById('statusFilters').innerHTML = filters
  if(filters === "") document.getElementById('statusFilters').innerHTML = "none"
  displayData(data);
}