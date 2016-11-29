var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE
var likePage = getQueryVariable('likePage');
var sinceDate = getQueryVariable('sinceDate');
var likeArray = [];
var postArray = [];
var temporaryPostArray = [];
var noMorePagesOfLikes = false;
var noMorePagesOfPosts = false;
var unique = require('uniq');

var data = [1,2,3,4,5];

console.log(unique(data));

// var AWS = require('aws-sdk');
//
// var s3 = new AWS.S3();
//
//  s3.createBucket({Bucket: 'myBucket'}, function() {
//
//   var params = {Bucket: 'myBucket', Key: 'myKey', Body: 'Hello!'};
//
//   s3.putObject(params, function(err, data) {
//
//       if (err)
//
//           console.log(err)
//
//       else       console.log("Successfully uploaded data to myBucket/myKey");
//
//    });
//
// });

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
  getPostLikes();
});

function convertAndDownloadCSV(callback) {
  console.log('Converting');
  var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
  downloadCSV(convertedPostCSV);
  callback;
}

function getPostLikes(response, callback) {
  console.log('getting post likes')
    $.get('https://graph.facebook.com/v2.8/'+ likePage + '?fields=access_token,posts.since(' + sinceDate + '){likes{id}}&access_token=' + facebookKey, function (facebookData) {
      var likePageId = facebookData.id;
      var testPostArray = [];
      console.log(facebookData)
      checkForPostPages(facebookData, noMorePagesOfPosts, checkForData(facebookData));
    });
};

function checkForData(facebookData, callback) {
  console.log('checking for data')
  if ('posts' in facebookData) {
    postArray.push(facebookData.posts.data)
    console.log('moved current data to postArray')
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
  console.log('checking for new pages of posts');
  if ('paging' in data.posts && 'next' in data.posts.paging) {
    console.log('NEW PAGE FOUND')
    noMorePagesOfPosts = false;
    pageThroughPosts();
  }
  else {
    noMorePagesOfPosts = true;
    console.log('NO MORE PAGES FOR CURRENT DATA TYPE');
    return;
  }
}

function pageThroughPosts(callback) {
  if (noMorePagesOfPosts) {
    console.log('stop ajaxing for posts')
    return;
  }
  if (noMorePagesOfPosts == false) {
    console.log('ajaxing for posts')
    ajaxForPosts();
  }
  callback;
}

function ajaxForPosts(callback) {
  $.ajax({
    url: nextPage,
    success: function(nextPagePostData) {
      pageData = nextPagePostData;
      if (nextPagePostData.data.length != 0 ) {
        console.log('pushing more posts to array')
        pushToArray(nextPagePostData.data, postArray);
      } else {
        console.log('Successfully found all posts')
        getLikes(postArray);
      }
    },
    complete: function() {
      if ('paging' in pageData && 'next' in pageData.paging) {
        nextPage = pageData.paging.next;
        ajaxForPosts();
      }
      else {
        noMorePagesOfPosts = true;
        return;
        console.log('finished ajax for posts!')
      }
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
     array.forEach(function(innerObject) {
      var currentPostId = innerObject.id;
      pageThroughLikes(innerObject, currentPostId, noMorePagesOfLikes(innerObject));
      function noMorePagesOfLikes(data) {
        if ('likes' in data && 'paging' in data.likes && 'next' in data.likes.paging) {
          nextPageOfLikes = data.likes.paging.next;
          return false;
        } else {
          console.log('true')
          return true;
        }
      }
     })
   });
  callback;
}


function pageThroughLikes(data, currentPostId, likePageChecker) {
  console.log('running PageThroughLikes function')
  if (likePageChecker == true) {
    console.log('stop ajaxing for likes')
    return;
  }
  if (likePageChecker == false) {
    ajaxForLikes(currentPostId);
  }
}

function ajaxForLikes(currentPostId, callback) {
  console.log('ajaxing for likes')
  $.ajax({
    url: nextPageOfLikes,
    success: function(pageData) {
      nextPageLikeData = pageData;
      if (nextPageLikeData.data.length != 0 ) {
        createLikeObject(nextPageLikeData, currentPostId)
        console.log('pushed more data to postarray')
      };
    },
    complete: function() {
      if ('paging' in nextPageLikeData && 'next' in nextPageLikeData.paging) {
        nextPageOfLikes = nextPageLikeData.paging.next;
        ajaxForLikes(currentPostId);
      }
      else {
        noMorePagesOfLikes = true;
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
    likeObject.likes.paging.next = likeData.paging.next;
  }
  likeObject.id = postId;
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
  console.log('checking for new pages');
  if ('paging' in data && 'next' in data.paging) {
    console.log('NEW PAGE FOUND')
    noPages = false;
    callback;
  }
  else {
    noPages = true;
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
