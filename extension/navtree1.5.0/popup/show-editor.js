$('#nt-editor').addClass('show-editor');
$('.file-wrap table.files').before($('#editor'))

chrome.storage.sync.get({
  type: 'overlay',
  theme: 'dark'
}, function(items) {
  if(items.type === 'overlay') {
    $('#nt-editor').addClass('overlay');
    $('body').addClass('disable-scroll');
  } else {
    $('.file-wrap table.files').hide();
  }
});