var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE
var likePage = getQueryVariable('likePage');
var sinceDate = getQueryVariable('sinceDate');
var likeArray = [];
var postArray = [];
var noMorePagesOfLikes = false;
var noMorePagesOfPosts = false;

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  alert('Query Variable ' + variable + ' not found');
}
console.log('Page Search: ' + likePage);
console.log('Since: ' + sinceDate)

// FIND DATA FOR DOJOAPP FACEBOOK PAGE POSTS SINCE CHOSEN DATE

$(document).ready(function() {
  // getPostLikes(pageThroughLikes(postArray))
  getPostLikes()
 //  getPostLikes().then(function() {
 //  pageThroughLikes(postArray, test)
 // });
});

function convertAndDownloadCSV(callback) {
  console.log('Converting');
  var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
  downloadCSV(convertedPostCSV);
  callback;
}

function getPostLikes(response, callback) {
  // return new Promise(function (fulfill, reject) {
  console.log('getting post likes')
    $.get('https://graph.facebook.com/v2.8/'+ likePage + '?fields=access_token,posts.since(' + sinceDate + '){likes{id}}&access_token=' + facebookKey, function (facebookData) {
      var likePageId = facebookData.id;
      var testPostArray = [];
      console.log(facebookData)

      // checkForData(facebookData, checkForPages, facebookData, noMorePagesOfPosts, ajaxForPosts);

      // test(pageThroughLikes(postArray, ajaxForPosts(checkForPages(facebookData, noMorePagesOfPosts, checkForData(facebookData)))));
      pageThroughLikes(postArray, ajaxForPosts(checkForPages(facebookData, noMorePagesOfPosts, checkForData(facebookData))));


      // function checkForPages(data, noPages, callback) {
      //   console.log(data);
      //   if ('paging' in data && 'next' in data.paging) {
      //     console.log('NEW PAGE FOUND')
      //     noPages = false;
      //     callback();
      //   }
      //   else {
      //     noPages = true;
      //     console.log(noPages)
      //     console.log('NO MORE PAGES FOR CURRENT DATA TYPE');
      //     callback;
      //   }
      // }

      // function pushToArray(item, array, callback) {
      //   array.push(item);
      //   callback()
      // }

      ///////////////////
      // if ('posts' in facebookData) {
      //   var nextPage = facebookData.posts.paging.next;
      //   console.log(facebookData);
      //   var check = 0;
      //   postArray.push(facebookData.posts.data);
      //   var currentDataLength = ' '
      //   var i = 0
      //   if ('paging' in facebookData.posts) {
      //     console.log('new page available');
      //     do {
      //       $.ajax({
      //         async: false,
      //         type: 'GET',
      //         url: nextPage,
      //         success: function(nextPageData) {
      //           console.log('New Post Page Accessed: ' + nextPage)
      //           i++;
      //           console.log(nextPageData)
      //           console.log('Paging Through Posts: ' + i)
      //           testPostArray.push(nextPageData.data);
      //           if ('paging' in nextPageData) {
      //             nextPage = nextPageData.paging.next;
      //             console.log('next page assigned: ' + nextPage);
      //           }
      //           currentDataLength = nextPageData.data.length;
      //           console.log(currentDataLength);
      //         }
      //       });
      //       console.log('DATA LENGTH: ' + currentDataLength);
      //     } while (currentDataLength > 0);
      //     testPostArray.forEach(function(element) {
      //       postArray.push(element);
      //       fulfill();
      //     });
      //   }
      // } else {
      //   console.log('Error: No facebook posts since this date!')
      //   reject();
      // }
    });
    // callback;
  // })
};

function checkForData(facebookData, callback) {
  console.log('checking for data')
  if ('posts' in facebookData) {
    postArray.push(facebookData.posts.data);
  }
  if ('paging' in facebookData.posts && 'next' in facebookData.posts.paging) {
    nextPage = facebookData.posts.paging.next
  }
  else {
    console.log('This page has not posted since your specified date.')
  }
}

function ajaxForPosts(callback) {
  console.log(noMorePagesOfPosts)
  if (noMorePagesOfPosts) {
    // callback
    return;
  }

  $.ajax({
    url: nextPage,
    success: function(nextPagePostData) {
      pageData = nextPagePostData;
      console.log(nextPagePostData)
      if (nextPagePostData.data.length != 0 ) {
        pushToArray(nextPagePostData.data, postArray);
      };
    },
    complete: function() {
      if ('paging' in pageData && 'next' in pageData.paging) {
        nextPage = pageData.paging.next;
        ajaxForPosts();
      }
      else {
        noMorePagesOfPosts = true;
        ajaxForPosts();
      }
    }
  })
}

// PAGE THROUGH LIKES FOR EACH OBJECT IN POST ARRAY

function pageThroughLikes(facebookPostArray, callback) {
 console.log('paging through likes')
 console.log(facebookPostArray)
 var testArray = []
 var promiseList = [];
 var counter = 0;

   facebookPostArray.forEach(function(array) {
     counter += 1;
     console.log(facebookPostArray)
     array.forEach(function(innerObject) {
       if ('likes' in innerObject && 'paging' in innerObject.likes && 'next' in innerObject.likes.paging) {
       var nextPage = innerObject.likes.paging.next;
       console.log('new likes page assigned: ' + nextPage);
       var currentPostId = innerObject.id;
       var i = 0;
       console.log(postArray.length);
       var pageData = '';

       function doAjaxRequest() {
         console.log(noMorePagesOfLikes)
         if (noMorePagesOfLikes) {
              callback;
              return;
            }

         $.ajax({
           url: nextPage,
           success: function(nextPageLikeData) {
             pageData = nextPageLikeData;
            //  createLikeObject(nextPageLikeData, currentPostId, checkForPages, nextPageLikeData, noMorePagesOfLikes)
             checkForPages(nextPageLikeData, noMorePagesOfLikes, createLikeObject(nextPageLikeData, currentPostId))
           },
           complete: function() {
             console.log('checking for more pages of likes')
             if ('paging' in pageData && 'next' in pageData.paging) {
               nextPage = pageData.paging.next;
               console.log('assigned next page of likes: ' + nextPage )
               doAjaxRequest();
             }
             else {
               noMorePagesOfLikes = true;
               doAjaxRequest();
             }
           }
         })
        }
        doAjaxRequest();
       }
     })
     console.log('lemon')
   });
   console.log(counter);
  //  if (counter == facebookPostArray.length) {
    if (noMorePagesOfLikes) {
     callback;
     console.log('moved on')
   }
}

function createLikeObject(likeData, postId, callback) {
  likeArrayFormat = [];
  likeObject = {};
  likeObject.likes = {};
  likeObject.id = postId;
  likeObject.likes.data = []
  likeData.data.forEach(function(like) {
    likeObject.likes.data.push(like);
  });
  likeArrayFormat.push(likeObject);
  postArray.push(likeArrayFormat);
  console.log('pushed new like data to postArray')
  callback;
}

function pushToArray(item, array, callback) {
  array.push(item);
  callback
}

function checkForPages(data, noPages, callback) {
  console.log(data);
  if ('paging' in data && 'next' in data.paging) {
    console.log('NEW PAGE FOUND')
    noPages = false;
    callback;
  }
  else {
    noPages = true;
    console.log(noPages)
    console.log('NO MORE PAGES FOR CURRENT DATA TYPE');
    callback;
  }
}

  // AUTO DOWNLOAD CSV FILE
  function downloadCSV(args) {
    console.log('Downloading CSV')
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV(postArray);
    if (csv == null) return;
    filename = 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  // CONVERT FACEBOOK POSTS OBJECTS TO CSV FORMAT

  function convertArrayOfObjectsToCSV(args, callback) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args || null;
    if (data == null || !data.length) {
      return null;
    }
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0]);
    result = '';
    result += 'user_id' + columnDelimiter + ' post_id' + columnDelimiter + ' page_id';
    result += lineDelimiter;

    args.forEach(function(object) {
      if (object.length != 0) {
        object.forEach(function(item) {
          if ('likes' in item && 'data' in item.likes) {
            var postId = item.id;
            item.likes.data.forEach(function(likeId) {
              if ('id' in likeId) {
                var likeArray = likeId;
                  result += likeArray.id + columnDelimiter + postId.split('_').reverse() + lineDelimiter;
              } else {
                result += columnDelimiter + postId.split('_').reverse() + lineDelimiter;
              };
            });
          }
        });
      }
    })
    console.log('converted to CSV')
  return result;
  callback();
  }
