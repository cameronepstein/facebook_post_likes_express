var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE
var likePage = getQueryVariable("likePage");
var sinceDate = getQueryVariable("sinceDate");
var likeArray = [];
var postArray = [];
var noMorePages = false;

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

$(document).ready(function() {
  getPostLikes().then(function() {
    // console.log(postArray);
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
                console.log("New Post Page Accessed: " + nextPage)
                i++;
                console.log("Paging Through Posts: " + i)
                testPostArray.push(nextPageData.data);
                if ('paging' in nextPageData) {
                  nextPage = nextPageData.paging.next;
                  console.log("next page assigned: " + nextPage);
                }
                currentDataLength = nextPageData.data.length;
                console.log(currentDataLength);
              }
            });
            console.log("DATA LENGTH: " + currentDataLength);
          } while (currentDataLength > 0);
          testPostArray.forEach(function(element) {
            // console.log(element)
            postArray.push(element);
            fulfill();
          });
        }
      } else {
        console.log('Error: No facebook posts since this date!')
        reject();
      }
      // console.log(postArray)
    });
  })
};
console.log("Downloading...")


function pageThroughLikes(facebookPostArray, callback) {
 console.log('paging through likes')
 var testArray = []
 var promiseList = [];
 // var noMorePages = false;
   facebookPostArray.forEach(function(array) {
     array.forEach(function(innerObject) {
       if ('likes' in innerObject && 'paging' in innerObject.likes && 'next' in innerObject.likes.paging) {
       var nextPage = innerObject.likes.paging.next;
       console.log('new likes page assigned: ' + nextPage);
       var currentPostId = innerObject.id;
       var i = 0;
       console.log(postArray.length)
       var pageData = '';

       function doAjaxRequest() {
         console.log(noMorePages)
         if (noMorePages) {
                 console.log('calling back')
                 callback();
              return;
            }

         $.ajax({
           url: nextPage,
           success: function(nextPageLikeData) {
             console.log(nextPageLikeData)
             pageData = nextPageLikeData;
             createLikeObject(nextPageLikeData, currentPostId, checkForPagesOfLikes, nextPageLikeData, noMorePages)
           },
           complete: function() {
             console.log('checking for more pages')
             console.log(pageData)
             if ('paging' in pageData && 'next' in pageData.paging) {
               nextPage = pageData.paging.next;
               console.log('assigned next page of likes!!!!!!!!!!!!!!!!!!!!!!!!!!!! ' + nextPage )
               doAjaxRequest();
             }
             else {
               noMorePages = true;
               console.log('else run')
               doAjaxRequest();
             }
           }
         })
        }
        doAjaxRequest();
       }
     })
   });
}

// function requestNextPageAndSaveData(page, callback) {
//   var nextPage = page
//   $.ajax({
//     url: nextPage,
//     success: function(nextLikePageData) {
//       createLikeObject(nextLikePageData, currentPostId, checkForPagesOfLikes, nextLikePageData, noMorePages)
//       if ('paging' in nextLikePageData && 'next' in nextLikePageData.paging) {
//         nextPage = nextLikePageData.paging.next;
//       }
//      }
//    })
//    callback();
// }

function createLikeObject(likeData, postId, callback, args, fail) {
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
  callback(args, fail)
}

function pushToArray(item, array, callback) {
  array.push(item);
  callback()
}

function checkForPagesOfLikes(data, noPages) {
  if ('paging' in data && 'next' in data.paging) {
    console.log('NEW PAGE OF LIKES FOUND')
    noPages = false;
  }
  else {
    noPages = true;
    console.log(noPages)
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

  function convertArrayOfObjectsToCSV(args, callback) {
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
    // console.log(args)
    args.forEach(function(object) {
      // console.log(object)
      // console.log(object.length)
      if (object.length != 0) {
        object.forEach(function(item) {
          if ('likes' in item && 'data' in item.likes) {
            var postId = item.id;
            item.likes.data.forEach(function(likeId) {
              if ('id' in likeId) {
                // console.log(likeId)
                var likeArray = likeId;
                // console.log(likeArray)
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
