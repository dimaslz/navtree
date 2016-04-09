$('.file-wrap table.files').hide();
$('#editor').addClass('show-editor');
$('.file-wrap table.files').before($('#editor'))

chrome.storage.sync.get({
  type: 'overlay',
  theme: 'dark'
}, function(items) {
  if(items.type === 'overlay') {
    $('#editor').addClass('overlay');
    $('body').addClass('disable-scroll');
  }
});