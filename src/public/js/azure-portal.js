// ---------------------------------------------------------------------------------------------
// ------------------------------------- Helper Functions --------------------------------------
// ---------------------------------------------------------------------------------------------

// var frameSignature = ...;  Defined by .html page that loaded this script.
var frameSignature = "ArmViewBlade";

// Capture the client session ID to use to correlate user actions and events within this
// client session.
var sessionId = location.hash.substr(1);

var queryMap = (function() {
  var query = window.location.search.substring(1);
  var parameterList = query.split("&");
  var map = {};
  for (var i = 0; i < parameterList.length; i++) {
    var pair = parameterList[i].split("=");
    map[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return map;
})();

function getQueryParameter(name) {
  return queryMap[name] || "";
}

function postMessageToParent(kind) {
  if(!trustedParentOrigin) return;
  
  window.parent.postMessage({
    signature: frameSignature,
    kind: kind
  }, trustedParentOrigin);
}

// ---------------------------------------------------------------------------------------------
// --------------------------------------- Security Code ---------------------------------------
// ---------------------------------------------------------------------------------------------

// Get the below trusted origins from configuration to include the origin of the portal in
// which the page needs to be iframe'd.
var allowedParentFrameAuthorities = ["localhost:3000", "portal.azure.com", "df.onecloud.azure-test.net"];

// Capture the origin of the parent and validate that it is trusted. If it is not a trusted
// origin, then DO NOT setup any listeners and IGNORE messages from the parent/owner window
var trustedParentOrigin = getQueryParameter("trustedAuthority");

/*var isTrustedOrigin = (function() {
  var trustedAuthority = (trustedParentOrigin.split("//")[1] || "").toLowerCase();
  return allowedParentFrameAuthorities.some(function(origin) {
    // Verify that the requested trusted authority is either an allowed origin or is a
    // subdomain of an allowed origin.
    return origin === trustedAuthority || (trustedAuthority.indexOf("." + origin) === trustedAuthority - origin - 1);
  });
})();
if (!isTrustedOrigin) {
  var errorMessage = "The origin '" + trustedParentOrigin + "' is not trusted.";
  console.error(sessionId, errorMessage);
  throw new Error(errorMessage);
}*/

window.addEventListener("message", function(evt) {
  console.log(`### Frame child, message recv: ${JSON.stringify(evt.data)} ${evt.origin}`);
  
  // It is critical that we only allow trusted messages through. Any domain can send a
  // message event and manipulate the html.
  if (evt.origin.toLowerCase() !== trustedParentOrigin) {
    return;
  }

  var msg = evt.data;

  // Check that the signature of the message matches that of frame parts.
  if (!msg || msg.signature !== frameSignature) {
    return;
  }

  // Handle different message kinds.
  if (msg.kind === "frametitle") {   
    start(msg);
  } else if (msg.kind === "framecontent") {
    //document.getElementsByClassName("fxs-frame-content")[0].innerText = msg.data;
  } else if (msg.kind === "getAuthTokenResponse") {
    //document.getElementsByClassName("fxs-frame-token")[0].innerText = "Token: " + msg.data;
  } else {
    console.warn(sessionId, "Message not recognized.", msg);
  }
}, false);
