var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE
var likePage = getQueryVariable("likePage");
var sinceDate = getQueryVariable("sinceDate");
var likeArray = [];
var postArray = [];

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  alert("Query Variable " + variable + " not found");
}
console.log("Page Search: " + likePage);
console.log("Since: " + sinceDate)

// FIND DATA FOR DOJOAPP FACEBOOK PAGE POSTS SINCE CHOSEN DATE

// $(document).ready(function() {
//   getPostLikes().then(function() {
//   console.log(postArray);
//   var list = pageThroughLikes(postArray);
//   console.log(list)
//   $.when.apply(this, list).done(function() {
//     var testArray = [];
//     console.log(list.length)
//     if(list.length > 1) {
//     $.each(arguments, function(k, v) {
//         var dt = processData(v[0]);
//         testArray.push(dt);
//         postArray.push(testArray);
//     })
//     } else {
//   console.log(arguments)
//     console.log(arguments[0])
//     var dt = processData(arguments[0]);
//     testArray.push(dt);
//     postArray.push(testArray);
//     console.log(postArray)
//     console.log(testArray)
//     }
//     test(postArray);
//    });
//  });
// });

$(document).ready(function() {
  getPostLikes().then(function() {
  pageThroughLikes(postArray, test)
 });
});

function test(postArray) {
  var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
  downloadCSV(convertedPostCSV);
}

function getPostLikes(response) {
  return new Promise(function (fulfill, reject) {
    $.get("https://graph.facebook.com/v2.8/"+ likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey, function (facebookData) {
      var likePageId = facebookData.id;
      var testPostArray = [];
      if ('posts' in facebookData) {
        var nextPage = facebookData.posts.paging.next;
        var check = 0;
        postArray.push(facebookData.posts.data);
        var currentDataLength = " "
        var i = 0
        if ('paging' in facebookData.posts) {
          console.log("new page available");
          do {
            $.ajax({
              async: false,
              type: "GET",
              url: nextPage,
              success: function(nextPageData) {
                console.log("New Page Accessed: " + nextPage)
                i++;
                console.log("Page Number: " + i)
                testPostArray.push(nextPageData.data);
                if ('paging' in nextPageData) {
                  nextPage = nextPageData.paging.next;
                  console.log("next page assigned");
                }
                currentDataLength = nextPageData.data.length;
                console.log(currentDataLength);
              }
            });
            console.log("DATA LENGTH: " + currentDataLength);
          } while (currentDataLength > 0);
          testPostArray.forEach(function(element) {
            console.log(element)
            postArray.push(element);
            fulfill();
          });
        }
      } else {
        console.log('Error: No facebook posts since this date!')
        reject();
      }
      console.log(postArray)
    });
  })
};
console.log("Downloading...")


function pageThroughLikes(facebookPostArray, callback) {
 console.log('paging through likes')
 var testArray = []
 var promiseList = [];
   facebookPostArray.forEach(function(array) {
     array.forEach(function(innerObject) {
       if ('likes' in innerObject && 'paging' in innerObject.likes && 'next' in innerObject.likes.paging) {
       var nextPage = innerObject.likes.paging.next;
       var currentPostId = innerObject.id;
       var noMorePages = false;
       var i = 0;
       do{
         $.ajax({
           url: nextPage,
           success: function(nextLikePageData) {
             createLikeObject(nextLikePageData, currentPostId, checkForPagesOfLikes, nextLikePageData, noMorePages)
             if ('paging' in nextLikePageData && 'next' in nextLikePageData.paging) {
               nextPage = nextLikePageData.paging.next;
             }
            }
          })
         i += 1
        } while (noMorePages = false);
       }
     })
   });
   console.log('paged through likes')
   callback();
}

function createLikeObject(likeData, postId, callback, args, fail) {
  likeObject = {};
  likeObject.likes = {};
  likeObject.id = postId;
  likeObject.likes.data = []
  likeData.data.forEach(function(like) {
    likeObject.likes.data.push(like);
  });
  postArray.push(likeObject);
  callback(args, fail)
}

function pushToArray(item, array, callback) {
  array.push(item);
  callback()
}

function checkForPagesOfLikes(data, noMorePages) {
  if ('paging' in data && 'next' in data.paging) {
      return true;
      console.log('NEW PAGE FOUND')
    }
  else {
    noMorePages = true;
    console.log('NO MORE PAGES OF LIKES FOR CURRENT OBJECT')
  }
}

  // AUTO DOWNLOAD CSV FILE
  function downloadCSV(args) {
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

  function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    // console.log(args)
    data = args || null;
    if (data == null || !data.length) {
      return null;
    }
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0]);
    result = '';
    result += "user_id" + columnDelimiter + " post_id" + columnDelimiter + " page_id";
    result += lineDelimiter;
    data.forEach(function(item) {
      item.forEach(function(post) {
        if ('likes' in post) {
          var likeArray = post.likes
          likeArray.data.forEach(function(like) {
            result += like.id + columnDelimiter + post.id.split('_').reverse() + lineDelimiter;
          });
        } else {
          result += columnDelimiter + post.id.split('_').reverse() + lineDelimiter;
        };
      });
    });
    console.log('converted to CSV')
  return result;
  }
