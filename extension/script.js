var n = 0;
var counter = 0;
var collection = [];
var editorVisible = false;
var altPressed = false;
var branches = [];
var defaultBranch = 'master';

var shaElement = $('.commit-tease-sha')[0].href;
var sha = shaElement.match(/([A-Za-z0-9]{30,})$/ig)[0];
var author = $('a[rel="author"]')[0].href.split('/').pop();
var repo = $('a[data-pjax*="js-repo-pjax-container"]')[0].href.split('/').pop();
var treeUrl = `https://api.github.com/repos/${author}/${repo}/git/trees/${sha}?recursive=1`;
var branchesUrl = `https://api.github.com/repos/${author}/${repo}/branches`;
var downloadUrl = `https://raw.githubusercontent.com/${author}/${repo}/${defaultBranch}/`;

chrome.storage.sync.set({
  active: false
});

chrome.storage.sync.get({
  token: false
}, function (items) {
  var accessToken = null;
  if (items.token) {
    accessToken = items.token;
  }
  
  var inputs = document.querySelectorAll('#type-form input');
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('click', setType);
  }

  /**
   * Arraytor
   */
  var arraytor = function (node, items) {
    if (items.length > 0) {
      for (var i = 0; i < items.length; i++) {
        navigator(node, items[i]);
      }
    } else {
      navigator(node, items[0]);
    }
  }

  /**
   * set token for requests
   */
  function beforeSend(xhr, settings) {
    if(accessToken) {
      xhr.setRequestHeader('Authorization', 'token '+accessToken);
    } else {
      console.info('NavTree Tip: ', 'Add a token to can avoid limit request and use in private repos. Look documentation: https://github.com/dimaslz/navtree');
    }
  };
  
  /**
   * Navigator
   */
  function navigator(node, item) {
    var re1 = new RegExp("^" + item.path + "/\\w+$", 'ig');
    var re2 = new RegExp("^" + item.path + "/[A-Za-z0-9-_]*\\..*?$", 'ig');
    if (re1.test(node.path) || re2.test(node.path)) {
      if (item.subNodes) {
        item.subNodes.push(node);
      } else {
        item.subNodes = [];
        item.subNodes.push(node);
      }
    } else if (item.subNodes) {
      arraytor(node, item.subNodes);
    }

    collection[collection.length - 1] = item;
  }

  /**
   * Recursive
   */
  var recursive = function () {
    if (/\//ig.test(dataNodes[0].path)) {
      navigator(dataNodes[0], collection[collection.length - 1])
    } else {
      collection.push(dataNodes[0]);
    }

    dataNodes.shift();
    if (dataNodes.length) {
      recursive(dataNodes);
    }
  }

  var altEventPressed = function() {
    document.addEventListener('keydown', function(e) {
      if(e.keyCode == 18) {
        altPressed = true;
      }
    });

    document.addEventListener('keyup', function(e) {
      if(e.keyCode == 18) {
        altPressed = false;
      }
    });
  }
  altEventPressed();

  /**
   * Add click event to files
   */
  function clickEvent(element, node) {
    $(element).not('.close').hover(function() {
      var button = $(this).find('a.button');
      button.toggleClass('over');
      button.on('click', function() {
        downloadFile(downloadUrl+node.path, node.path.split('/').slice(-1));
      });
    }, function() {
      $(this).find('a.button').toggleClass('over');
    });
    
    var link = element.querySelector('a.link');
    link.addEventListener('click', function (e) {
      var self = this;
      
      if (/[\.A-Za-z0-9-_]+\..*?$/i.test(node.path) || !node.subNodes) {
        if(altPressed) {
          console.log('dfasdfasd')
          downloadFile(downloadUrl+node.path, node.path.split('/').slice(-1));
        } else {
          $('.loader-wrapper').show();
          $.ajax({
            url: self.getAttribute('url-data'),
            dataType: 'json',
            data: {},
            success: function (data, status) {
              $('.loader-wrapper').hide();
              var content = '';
              if (/gif|png|jpg|jpeg/i.test(node.path)) {
                var contentImage = document.createElement('div');
                contentImage.id = "content-image";
                contentImage.style = 'width: 100% !important; height: 100%; display: flex';
                var img = document.createElement('img');
                img.src = 'data:image/*;base64,' + data.content
                contentImage.appendChild(img);
                content = contentImage;
              } else {
                var pre = document.createElement('pre');
                var code = document.createElement('code');
                pre.appendChild(code);
                content = pre;
              }
              
              var downloadButton = document.createElement('a');
              downloadButton.className = 'button download';
              downloadButton.setAttribute('download', node.path.split('/').slice(-1));
              downloadButton.href = downloadUrl+node.path;

              $('#preview #preview-content').html(content);
              $('#preview #preview-title').text(node.path);
              $('#preview #preview-title').append(downloadButton);
              if (/gif|png|jpg|jpeg/i.test(node.path)) {
                $('#preview #preview-content pre code').text(escape(window.atob(data.content)))
              } else {
                $('#preview #preview-content pre code').text(decodeURIComponent(escape(window.atob(data.content))))
              }

              hljs.initHighlightingOnLoad();
              // hljs.configure({useBR: true});
              $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
              });
            }, error: function(xhr, ajaxOptions, thrownError) {
              if(!accessToken) {
                console.error('NavTree Error: ', thrownError, ' - You need a token access to avoid limit request and can use NavTree in private repositories. Look documentation: https://github.com/dimaslz/navtree');  
              } else {
                console.error('NavTree Error: ', thrownError, ' - Check your token access and fix credentials');
              }
            },
            beforeSend: beforeSend
          });
          e.stopPropagation(); 
        } 
      } else {
        $(self).parent('li').toggleClass('open');
        $(self).parent('li').find('ul').eq(0).toggleClass('black')
      }
    });
  }

  /**
   * Download file
   */
  function downloadFile(url, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  
  /**
   * CreateTree
   */
  function createTree(domElement, treeNode) {
    var ul = document.createElement('ul'),
      a = document.createElement('a'),
      li,
      n;

    // Make a <ul> to hold the current tree node's children (if any)
    domElement.appendChild(ul)

    // Loop over current tree node's children
    for (n in treeNode) {
      // Create an <li> and <a> element
      li = document.createElement('li');
      a = document.createElement('a');
      a.className = 'link';
      a.setAttribute('url-data', treeNode[n].url)
      
      if (/[\.A-Za-z0-9-_]+\..*?$/ig.test(treeNode[n].path) || !treeNode[n].subNodes) {
        var cloud = document.createElement('a');
        cloud.className = 'button file';
        // cloud.href = downloadUrl+treeNode[n].path;
        // cloud.setAttribute('download', treeNode[n].path.split('/').slice(-1));
        li.appendChild(cloud);
      } else {
        li.className = 'close';
      }
      a.innerHTML += treeNode[n].path.split('/').pop();
      
      li.appendChild(a)
      clickEvent(li, treeNode[n]);

      // If the current tree node child is an array...
      if (treeNode[n].subNodes instanceof Array) {
        // Recursively get this node's children, etc
        createTree(li, treeNode[n].subNodes);
      }
      else {
        // Otherwise just print the "value" text (eg. "Demo View 11")
        // a = document.createElement('a');
        // a.href = '#';

        // Add the "key" text (eg. "Demo Sheet 1")
        // a.innerHTML = treeNode[n].path;
        // li.innerHTML = a.innerHTML;
        // li.appendChild(a)
      }

      // add li to ul
      ul.appendChild(li);
    }
  }

  $.ajax({
    url: 'https://api.github.com/repos/' + author + '/' + repo + '/git/trees/' + sha + '?recursive=1',
    dataType: 'json',
    data: {},
    success: function (data, status) {
      dataNodes = data.tree;
      recursive(dataNodes);

      // create editor element
      var editorElement = document.createElement('div');
      editorElement.id = 'editor';

      // create preview element 
      var previewElement = document.createElement('div');
      previewElement.id = 'preview';
      var previewTitleElement = document.createElement('h1');
      previewTitleElement.id = 'preview-title';
      var previewContentElement = document.createElement('div');
      previewContentElement.id = 'preview-content';
      previewElement.appendChild(previewTitleElement);
      previewElement.appendChild(previewContentElement);

      // Loader
      var div3 = document.createElement('div');
      div3.className = 'spinner';
      var div2 = document.createElement('div');
      div2.className = 'loader';
      div2.appendChild(div3);
      var div1 = document.createElement('div');
      div1.className = 'loader-wrapper';
      div1.appendChild(div2);
      previewElement.appendChild(div1);


      // create tree nav element
      var treeElement = document.createElement('div');
      treeElement.id = 'tree';
      editorElement.appendChild(treeElement);
      editorElement.appendChild(previewElement);

      // append editor to body    
      document.body.appendChild(editorElement);
      // now, we need create tree navigator
      createTree(treeElement, collection)

      /**
       * Bubble button
       */
      var bubble = document.createElement('img');
      bubble.src = chrome.extension.getURL("images/bubble.png");
      bubble.id = 'button-hide';
      bubble.addEventListener('click', function (value, index) {
        chrome.storage.sync.get({
          active: false
        }, function (items) {
          if (!items.active) {
            chrome.storage.sync.set({
              active: true
            });

            $('#editor').addClass('show-editor');
            $('.file-wrap table.files').before($('#editor'))

            chrome.storage.sync.get({
              type: 'overlay',
              theme: 'dark'
            }, function (items) {
              if (items.type === 'overlay') {
                $('#editor').addClass('overlay');
                $('body').addClass('disable-scroll');
              } else {
                $('.file-wrap table.files').hide();
              }
            });
          } else {
            $('#editor').removeClass('show-editor');

            chrome.storage.sync.get({
              type: 'overlay',
              theme: 'dark'
            }, function (items) {
              if (items.type === 'overlay') {
                $('body').removeClass('disable-scroll');
              } else {
                $('.file-wrap table.files').show();
              }
            });

            chrome.storage.sync.set({
              active: false
            });
          }
        }
        );
      });

      $('.loader-wrapper').hide();
      document.body.appendChild(bubble);

      document.addEventListener('keydown', function (e) {
        chrome.storage.sync.get({
          active: false
        }, function (items) {
          if (!items.active && e.keyCode === 69 && e.ctrlKey) {
            chrome.storage.sync.set({
              active: true
            });

            $('#editor').addClass('show-editor');
            $('.file-wrap table.files').before($('#editor'))

            chrome.storage.sync.get({
              type: 'overlay',
              theme: 'dark'
            }, function (items) {
              if (items.type === 'overlay') {
                $('#editor').addClass('overlay');
                $('body').addClass('disable-scroll');
              }
            });
          }
        });
        
        if (e.keyCode === 27 && $('#editor').hasClass('show-editor')) {
          $('#editor').removeClass('show-editor');
          chrome.storage.sync.get({
            type: 'overlay',
            theme: 'dark'
          }, function (items) {
            if (items.type === 'overlay') {
              $('body').removeClass('disable-scroll');
            } else {
              $('.file-wrap table.files').show();
            }
          });

          chrome.storage.sync.set({
            active: false
          });
        }
      })
    }, error: function(xhr, ajaxOptions, thrownError) {
      if(!accessToken) {
        console.error('NavTree Error: ', thrownError, ' - You need a token access to avoid limit request and can use NavTree in private repositories. Look documentation: https://github.com/dimaslz/navtree');  
      } else {
        console.error('NavTree Error: ', thrownError, ' - Check your token access and fix credentials');
      }
    },
    beforeSend: beforeSend
  });
});