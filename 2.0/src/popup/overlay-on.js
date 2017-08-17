$('#nt-editor').addClass('overlay');
$('.file-wrap table.files').show();
chrome.storage.sync.get({
  active: false
}, function(items) {
  if(items.active) {
    $('body').addClass('disable-scroll');
  }
});