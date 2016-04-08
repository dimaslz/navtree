$('.file-wrap table.files').toggle();
$('#editor').toggleClass('show-editor');
$('.file-wrap table.files').before($('#editor'))

chrome.storage.sync.get({
  type: 'overlay',
  theme: 'dark'
}, function(items) {
  if(items.type === 'overlay') {
    $('body').toggleClass('disable-scroll');
  }
});