acquireVsCodeApi = function() {
  return {
    postMessage(msg) {
      window.postMessage(msg, "*");
    }
  }
}