// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "myNetworkExt",
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
});

function setStatus(stat) {
  const el = document.querySelector('#status');
  el.innerHTML = stat;
}

function addURL(url) {
  const li = document.querySelector('#list');
  const item = document.createElement('li');
  item.innerHTML = url;
  li.appendChild(item);
}

backgroundPageConnection.onMessage.addListener(function (msg) {
  switch (msg.typ) {
  case 'status':
    setStatus(msg.txt);
    break;
  case 'req':
    addURL(msg.url);
    break;
  }
});

backgroundPageConnection.postMessage({
  name: 'init-panel',
});
