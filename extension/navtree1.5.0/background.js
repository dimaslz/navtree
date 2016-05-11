window.setTimeout(function() {
  chrome.browserAction.setIcon({path: "images/icon16_off.png"});
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      chrome.tabs.getSelected(null, function(tab) {
        if(/https:\/\/*github.com\/.*?\/.*/ig.test(tab.url)) {
          chrome.browserAction.setIcon({path: "images/icon16.png"});
        } else {
          chrome.browserAction.setIcon({path: "images/icon16_off.png"});
        }
      });
    }
  });
  
  chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
    console.log('actived', window.location)
    chrome.tabs.getSelected(changeInfo, function(tab) {
      var tabId = tab.id;
      if(/https:\/\/*github.com\/.*?\/.*/ig.test(tab.url)) {
        chrome.browserAction.setIcon({path: "images/icon16.png"});
      } else {
        chrome.browserAction.setIcon({path: "images/icon16_off.png"});
      }
    });
  });
}, 1000);