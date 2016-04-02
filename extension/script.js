var n = 0;
var counter = 0;
var collection = [];
// $("body").addClass("editor-open");

/**
 * Arraytor
 */
var arraytor = function(node, items) {
	if(items.length > 0) {
  	for(var i = 0; i < items.length; i++) {
      navigator(node, items[i]);
    }
  } else {
  	navigator(node, items[0]);
  }
}

/**
 * Navigator
 */
function navigator(node, item) {
	var re1 = new RegExp("^"+item.path+"/\\w+$", 'ig');
  var re2 = new RegExp("^"+item.path+"/[A-Za-z0-9-_]*\\..*?$", 'ig');
  if(re1.test(node.path) || re2.test(node.path)) {
  	if(item.subNodes) {
    	item.subNodes.push(node);
    } else {
    	item.subNodes = [];
    	item.subNodes.push(node);
    }
  } else if(item.subNodes) {
    arraytor(node, item.subNodes);
  }
  
  collection[collection.length-1] = item;
}

/**
 * Recursive
 */
var recursive = function() {
	if(/\//ig.test(dataNodes[0].path)) {
    navigator(dataNodes[0], collection[collection.length-1])
  } else {
  	collection.push(dataNodes[0]);
  }
  
  dataNodes.shift();
  if(dataNodes.length) {
  	recursive(dataNodes);
  }
}

/**
 * Add click event to files
 */
function clickEvent(element, node) {
  if(/[\.A-Za-z0-9-_]+\..*?$/ig.test(node.path) || !node.subNodes) {
      element.addEventListener('click', function(e) {
        $('.loader-wrapper').show();
        var self = this;
        $.ajax({
          url: self.getAttribute('url-data'),
          dataType: 'json',
          data: {},
          success: function(data, status) {
            $('.loader-wrapper').hide();
            var content = '';
            if(/gif|png|jpg|jpeg/ig.test(node.path)) {
              var img = document.createElement('img');
              img.src = 'data:image/png;base64,'+data.content
              content = img;
            } else {
              var pre = document.createElement('pre');
              var code = document.createElement('code');
              pre.appendChild(code);
              content = pre;  
            }
            
            $('#preview #preview-content').html(content);
            $('#preview #preview-title').text(node.path)
            // $('#preview #preview-content pre code').text(window.atob(data.content))
            $('#preview #preview-content pre code').text(decodeURIComponent(escape(window.atob( data.content ))))
            
            hljs.initHighlightingOnLoad();
            // hljs.configure({useBR: true});
            $('pre code').each(function(i, block) {
              hljs.highlightBlock(block);
            });
          },
          // beforeSend: function(xhr, settings) {
          //   xhr.setRequestHeader('Authorization', 'token FUTURE_TOKEN')
          // }
        });
        e.stopPropagation();
      });
    }
}

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
    a.href = '#';
    a.setAttribute('url-data', treeNode[n].url)
    
    clickEvent(a, treeNode[n]);
    
    // Add the "key" text (eg. "Demo Sheet 1")
    a.innerHTML = treeNode[n].path;
    a.setAttribute('url-data', treeNode[n].url)
    
    clickEvent(a, treeNode[n]);
    
    li.appendChild(a)
    
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


var shaElement = $('.commit-tease-sha')[0].href;
var sha = shaElement.match(/([A-Za-z0-9]{30,})$/ig)[0];
var author = $('a[rel="author"]')[0].href.split('/').pop();
var repo = $('a[data-pjax*="js-repo-pjax-container"]')[0].href.split('/').pop();

$.ajax({
  url: 'https://api.github.com/repos/'+author+'/'+repo+'/git/trees/'+sha+'?recursive=1',
  dataType: 'json',
  data: {},
  success: function(data, status) {
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
    div3.className ='spinner';
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
    
    // add over to li
    var lis = document.querySelectorAll('#tree li');
    for(var i = 0; i < lis.length; i++) {
      lis[i].addEventListener('click', function(e) {
        $(this).find('ul').eq(0).toggleClass('black')
        e.stopPropagation();
      });
      
      lis[i].addEventListener('mouseenter', function(e) {
        $(this).toggleClass('over');
        e.stopPropagation();
      });
      lis[i].addEventListener('mouseleave', function(e) {
        $(this).toggleClass('over');
        e.stopPropagation();
      });
    }
    
    
    /**
     * Bubble button
     */    
    var bubble = document.createElement('img');
    bubble.src = chrome.extension.getURL("images/bubble.png");
    bubble.id = 'button-hide';
    bubble.addEventListener('click', function(value, index) {
      $('#editor').toggleClass('show-editor');
      $('body').toggleClass('editor-open');
    });
    
    $('.loader-wrapper').hide();
    document.body.appendChild(bubble);
    
    document.addEventListener('keydown', function(e) {
      if(e.keyCode === 69 && e.ctrlKey) {
        $('#editor').toggleClass('show-editor');
        $('body').toggleClass('editor-open');
      }
    })
  },
  // beforeSend: function(xhr, settings) {
  //   xhr.setRequestHeader('Authorization', 'token FUTURE_TOKEN')
  // }
});