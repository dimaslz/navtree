function saveChromeStorage(object) {
  chrome.storage.sync.set(object, function() {});
}
function setType(type) {
  saveChromeStorage({
    type: type.path[0].defaultValue
  })
}

document.addEventListener('DOMContentLoaded', function () {
  var switcher = document.querySelector('#switcher');
  var types = document.querySelectorAll('#type-form input');
  var themes = document.querySelectorAll('#theme input');
  
  chrome.storage.sync.get({
    type: 'overlay',
    theme: 'dark',
    active: false
  }, function(items) {
    switcher.checked = items.active;
    document.querySelector('#type-form input[value="'+items.type+'"]').checked = true;
    document.querySelector('#theme input[value="'+items.theme+'"]').checked    = true;
  });

  var inputs = document.querySelectorAll('#type-form input');
  for(var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('click', setType);
  }
  
  switcher.addEventListener('click', function() {
    if(this.checked) {
      chrome.tabs.executeScript(null, {
        file: "popup/show-editor.js"
      });
    } else {
      chrome.tabs.executeScript(null, {
        file: "popup/close-editor.js"
      });
    }
    
    chrome.storage.sync.set({
      active: this.checked
    }, function() {});
  })
    
  for(var i = 0; i<types.length; i++) {
    types[i].addEventListener('click', function() {
      if(this.value === 'overlay') {
        chrome.tabs.executeScript(null, {
          file: "popup/overlay-on.js"
        });
      } else {
        chrome.tabs.executeScript(null, {
          file: "popup/overlay-off.js"
        });
      }
      chrome.storage.sync.set({
        type: this.value
      });
    });
  }
  
  for(var i = 0; i<themes.length; i++) {
    themes[i].addEventListener('click', function() {
      chrome.storage.sync.set({
        theme: this.value
      });
    });
  }
});