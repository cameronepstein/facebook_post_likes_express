var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE
var likePage = getQueryVariable('likePage');
var sinceDate = getQueryVariable('sinceDate');
var likeArray = [];
var postArray = [];
var temporaryPostArray = [];
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
  getPostLikes();
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
      // pageThroughLikes(postArray, pageThroughPosts(checkForPostPages(facebookData, noMorePagesOfPosts, checkForData(facebookData))));
      // pageThroughLikes(postArray, checkForPostPages(facebookData, noMorePagesOfPosts, checkForData(facebookData)));
      checkForPostPages(facebookData, noMorePagesOfPosts, checkForData(facebookData));
      // checkForData(facebookData, checkForPostPages(facebookData, noMorePagesOfPosts, ))
    });
    // callback;
  // })
};

function checkForData(facebookData, callback) {
  console.log('checking for data')
  // console.log(facebookData)
  if ('posts' in facebookData) {
    console.log(facebookData)
    console.log(postArray)
    postArray.push(facebookData.posts.data)
    console.log('moved current data to postArray')
    console.log(postArray)
  }
  if ('paging' in facebookData.posts && 'next' in facebookData.posts.paging) {
    nextPage = facebookData.posts.paging.next
    console.log('assigned new page of data')
  }
  else {
    console.log('This page has not posted since your specified date.')
  }
}

function checkForPostPages(data, noPages, callback) {
  console.log(data)
  console.log('checking for new pages');
  if ('paging' in data.posts && 'next' in data.posts.paging) {
    console.log('NEW PAGE FOUND')
    noMorePagesOfPosts = false;
    // pageThroughPosts(ajaxForPosts(pageThroughLikes(postArray, convertAndDownloadCSV())));
    pageThroughPosts();
  }
  else {
    noMorePagesOfPosts = true;
    console.log(noPages)
    console.log('NO MORE PAGES FOR CURRENT DATA TYPE');
    return;
  }
}

function pageThroughPosts(callback) {
  console.log(noMorePagesOfPosts)
  if (noMorePagesOfPosts) {
    // callback
    console.log('stop ajaxing for posts')
    return;
  }
  if (noMorePagesOfPosts == false) {
    console.log('ajaxing for posts')
    // ajaxForPosts(pageThroughLikes(postArray, convertAndDownloadCSV()));
    ajaxForPosts();
  }
  callback;
}

function ajaxForPosts(callback) {
  $.ajax({
    url: nextPage,
    success: function(nextPagePostData) {
      console.log('right')
      pageData = nextPagePostData;
      console.log(nextPagePostData)
      console.log(nextPagePostData.data.length)
      if (nextPagePostData.data.length != 0 ) {
        console.log('pushing more posts to array')
        pushToArray(nextPagePostData.data, postArray);
      } else {
        console.log('Successfully found all posts')
        getLikes(postArray);
        // return;
      }
    },
    complete: function() {
      console.log('test')
      if ('paging' in pageData && 'next' in pageData.paging) {
        nextPage = pageData.paging.next;
        // ajaxForPosts(pageThroughLikes(postArray, convertAndDownloadCSV()));
        // ajaxForPosts(pageThroughLikes(postArray));
        ajaxForPosts();
      }
      else {
        noMorePagesOfPosts = true;
        // callback;
        return;
        // testy.x(10).then(getLikes(postArray));
        console.log('finished ajax for posts!')
      }
    }
  })
}

function callbackTest(callback) {
  console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> !!!!!!!!!! testing time for callback - Final function this should be')
  callback;
}

// PAGE THROUGH LIKES FOR EACH OBJECT IN POST ARRAY
function checkForEndOfProcess() {
  return new Promise(function(resolve, reject) {
    function x(num) {
      num * 2000
    };
    console.log(num);
    if(num > 0) {
      resolve('x is the right amount')
    }
    else {
      reject(Error('Somethings gone horribly wrong'));
    }
  })
}


function getLikes(facebookPostArray, callback) {
 console.log('paging through likes')
 console.log(facebookPostArray)
 var testArray = []
 var promiseList = [];
 var counter = 0;

   facebookPostArray.forEach(function(array) {
     counter += 1;
    //  console.log(facebookPostArray)
     array.forEach(function(innerObject) {
      //  checkForLikePages(innerObject, pageThroughLikes)
      // pageThroughLikes(innerObject, noMorePagesOfLikes(innerObject));
      var currentPostId = innerObject.id;
      console.log(currentPostId)
      pageThroughLikes(innerObject, currentPostId, noMorePagesOfLikes(innerObject));
      console.log('line after 187 now running!')
      //  if ('likes' in innerObject && 'paging' in innerObject.likes && 'next' in innerObject.likes.paging) {
      //  var nextPageOfLikes = innerObject.likes.paging.next;
      //  console.log('new likes page assigned: ' + nextPage);
      //  var i = 0;
      //  console.log("postArray length: " + postArray.length);
      //  var pageData = '';
      //
      //  function doAjaxRequest() {
      //    console.log(noMorePagesOfLikes)
      //    if (noMorePagesOfLikes) {
      //      console.log('no more pages of likes')
      //     //  callback;
      //         // convertAndDownloadCSV();
      //         return;
      //       }
      //
      //    $.ajax({
      //      url: nextPageOfLikes,
      //      success: function(nextPageLikeData) {
      //        console.log('new like page accessed')
      //        pageData = nextPageLikeData;
      //       //  createLikeObject(nextPageLikeData, currentPostId, checkForPages, nextPageLikeData, noMorePagesOfLikes)
      //        checkForLikePages(nextPageLikeData, noMorePagesOfLikes, createLikeObject(nextPageLikeData, currentPostId));
      //      },
      //      complete: function() {
      //        console.log('checking for more pages of likes')
      //        if ('paging' in pageData && 'next' in pageData.paging) {
      //          nextPageOfLike = pageData.paging.next;
      //          console.log('assigned next page of likes: ' + nextPage )
      //          doAjaxRequest();
      //        }
      //        else {
      //          noMorePagesOfLikes = true;
      //          doAjaxRequest();
      //        }
      //      }
      //    })
      //   }
      //   doAjaxRequest();
      // } else {
      function noMorePagesOfLikes(data) {
        if ('likes' in data && 'paging' in data.likes && 'next' in data.likes.paging) {
          nextPageOfLikes = data.likes.paging.next;
          // noMorePagesOfLikes = false;
          console.log('no more pages of likes = false')
          return false;
        } else {
          // noMorePagesOfLikes = true;
          console.log('true')
          return true;
        }
      }
      //   callback;
      // }
     })
   });
   console.log(counter);
  //  if (counter == facebookPostArray.length) {
  //   if (noMorePagesOfLikes) {
  //    callback;
  //    console.log('moved on')
  //  }
  callback;
}


function pageThroughLikes(data, currentPostId, likePageChecker) {
  // console.log("no more pages of likes = " + noMorePagesOfLikes)
  console.log('running PageThroughLikes function')
  if (likePageChecker == true) {
    // callback
    // convertAndDownloadCSV();
    console.log('stop ajaxing for likes')
    return;
  }
  if (likePageChecker == false) {
    // ajaxForLikes(convertAndDownloadCSV());
    ajaxForLikes(currentPostId);
    console.log(currentPostId)
  }
  // callback;
}

function ajaxForLikes(currentPostId, callback) {
  console.log('ajaxing for likes')
  $.ajax({
    url: nextPageOfLikes,
    success: function(pageData) {
      console.log('rightmalove')
      nextPageLikeData = pageData;
      console.log(nextPageLikeData)
      // console.log(innerObject);
      console.log(currentPostId)
      if (nextPageLikeData.data.length != 0 ) {
        console.log(currentPostId)
        createLikeObject(nextPageLikeData, currentPostId)
        console.log('pushed more data to postarray')
        // NOT SURE WHETHER TO PUSH NEXTPAGELIKEDATA
        // pushToArray(nextPageLikeData.data, postArray);
      };
      console.log(nextPageLikeData)
    },
    complete: function() {
      console.log(nextPageLikeData)
      if ('paging' in nextPageLikeData && 'next' in nextPageLikeData.paging) {
        nextPageOfLikes = nextPageLikeData.paging.next;
        ajaxForLikes(currentPostId);
      }
      else {
        noMorePagesOfLikes = true;
        // callback;
        console.log(postArray )
        console.log('finished ajax for likes!')
        convertAndDownloadCSV();
        return;
      }
    }
  })
  callback;
}


function createLikeObject(likeData, postId, callback) {
  likeArrayFormat = [];
  likeObject = {};
  likeObject.likes = {};
  likeObject.likes.paging = {};
  if ('paging' in likeData && 'next' in likeData.paging) {
    console.log(likeData)
    likeObject.likes.paging.next = likeData.paging.next;
  }
  likeObject.id = postId;
  console.log(postId);
  likeObject.likes.data = []
  likeData.data.forEach(function(like) {
    likeObject.likes.data.push(like);
  });
  likeArrayFormat.push(likeObject);
  postArray.push(likeArrayFormat);
  console.log('pushing new like data to postArray')
  callback;
}

function pushToArray(item, array, callback) {
  array.push(item);
  callback
}


function checkForLikePages(data, noPages, callback) {
  console.log(data)
  console.log('checking for new pages');
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
            console.log(item)
            console.log(postArray)
            console.log(item.id)
            var postId = item.id;
            if (item.id == undefined) {console.log(result)}
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
