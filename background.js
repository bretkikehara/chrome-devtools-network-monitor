// background.js
var connections = {};

function clearConnection(port) {
  var tabs = Object.keys(connections);
  for (var i = 0, len = tabs.length; i < len; i++) {
    if (connections[tabs[i]] == port) {
      delete connections[tabs[i]]
      break;
    }
  }
}

function getConnection(tabId) {
  return connections[tabId];
}

function addConnection(tabId, port) {
  connections[tabId] = port;
}

function addPortListener(port, name, extensionListener, removeListener) {
  if (port.name !== name) {
    return;
  }
  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener(function(port) {
    port.onMessage.removeListener(extensionListener);
    removeListener(port);
  });
}

chrome.runtime.onConnect.addListener(function (port) {
  addPortListener(port, 'myNetworkExt', function (message, sender) {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    switch (message.name) {
    case "init":
      addConnection(message.tabId, port);
      sender.postMessage({
        typ: 'status',
        txt: 'connection establised',
      });
      break;
    case "init-panel":
      sender.postMessage({
        typ: 'status',
        txt: 'all ready',
      });
      break;
    }
  }, clearConnection);
});

chrome.webRequest.onBeforeRequest.addListener(function(wr) {
  const port = getConnection(wr.tabId);
  if (port) {
    port.postMessage({
      typ: 'req',
      url: wr.url,
    });
  }
}, {
  urls: ["<all_urls>"]
}, [

]);
