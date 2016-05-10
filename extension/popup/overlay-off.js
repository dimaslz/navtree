$('#nt-editor').removeClass('overlay');
$('body').removeClass('disable-scroll');

chrome.storage.sync.get({
  active: false
}, function(items) {
  if(items.active) {
    $('.file-wrap table.files').hide();
  }
});