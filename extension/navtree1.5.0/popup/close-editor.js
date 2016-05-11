$('.file-wrap table.files').show();
$('#nt-editor').removeClass('show-editor');

chrome.storage.sync.get({
  type: 'overlay',
  theme: 'dark'
}, function(items) {
  if(items.type === 'overlay') {
    $('body').removeClass('disable-scroll');
  }
});