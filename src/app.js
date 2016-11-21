var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE

var likePage = getQueryVariable("likePage");
var sinceDate = getQueryVariable("sinceDate");
var likeArray = [];
var postArray = [];
var postAndLikeArray = [];
var testArray = [];

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
    pageThroughLikes(postArray).then(function() {
      pushPagesToPostArray().then(function() {
        test();
      })
      // test = convertArrayOfObjectsToCSV(postArray);
      // console.log(test)
  //
  //
  //
  //     // var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
  //     // console.log(convertedPostCSV)
  //     // downloadCSV(convertedPostCSV);
      });
    });
  // test().then(function() {
  //   test2().then(function() {
  //     console.log('3')
  //   })
  // })
  });

test = function() {
  return new Promise(function(fulfill, reject) {
    console.log(postArray)
    fulfill();
  })
}

pushPagesToPostArray = function() {
  return new Promise(function(fulfill, reject) {
    postArray.push(testArray);
    fulfill();
  })
}


getPostLikes = function(response) {
  return new Promise(function (fulfill, reject) {
    $.get("https://graph.facebook.com/v2.8/"+ likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey, function (facebookData) {

      var likePageId = facebookData.id;
      var postTestArray = [];
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
                postTestArray.push(nextPageData.data);
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
          postTestArray.forEach(function(element) {
            postArray.push(element);
          });
        }
      } else {
        console.log('Error: No facebook posts since this date!')
        reject();
      }
      // console.log(postArray)
      // var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
      // downloadCSV(convertedPostCSV);
    });
    fulfill();
  })
};
console.log("Downloading...")

function pageThroughLikes(facebookPostArray) {
  console.log(postArray)
  return new Promise(function (fulfill, reject) {
    facebookPostArray.forEach(function(array) {
      array.forEach(function(innerObject) {
        if ('likes' in innerObject) {
          if ('paging' in innerObject.likes) {
            if ('next' in innerObject.likes.paging) {
              nextPage = innerObject.likes.paging.next;
              currentPostId = innerObject.id;
              currentDataLength = innerObject.likes.data.length;
              i = 0;
              do{
                $.get(nextPage, function(nextLikePageData) {
                  likeData = {};
                  likeData.id = currentPostId;
                  likeData.likes = {};
                  likeData.likes.data = nextLikePageData.data
                  likeData.likes.paging = nextLikePageData.paging
                  console.log(likeData)
                  testArray.push(likeData)
                })
                i += 1;
              } while (currentDataLength != 0 && i > 10)
            }
          }
        }
      })
    });
    fulfill();
  })
}

      // function pageThroughLikes(facebookPostArray) {
      //   facebookPostArray.forEach(function(element) {
      //     element.forEach(function(innerElement) {
      //       temporaryLikeArray = [];
      //       temporaryLikeArray.push(innerElement);
      //       temporaryLikeArray.forEach(function(post) {
      //         if ('likes' in post) {
      //           if ('paging' in post.likes) {
      //             if ('next' in post.likes.paging) {
      //               nextPage = post.likes.paging.next
      //               i = 0;
      //               currentPostID = post.id;
      //               do {
      //                 $.get({
      //                   url: nextPage,
      //                   success: function(nextPageLikeData) {
      //
      //                     nextPageLikeData.id = currentPostID;
      //                     nextPageLikeData.likes = {}
      //                     nextPageLikeData.likes.data = nextPageLikeData.data;
      //                     temporaryLikeArray.push(nextPageLikeData);
      //                     i += 1;
      //                     console.log(i)
      //                     if ('paging' in nextPageLikeData) {
      //                       if ('next' in nextPageLikeData.paging) {
      //                         nextPage = nextPageLikeData.paging.next
      //                       }
      //                     }
      //                     currentDataLength = nextPageLikeData.data.length
      //                   }
      //                 })
      //               } while ( currentDataLength != 0 && i > 10 )
      //               console.log(temporaryLikeArray)
      //             } likeArray.push(temporaryLikeArray);
      //           }
      //         }
      //       })
      //     });
      //   })
      // }

      // pageThroughLikes(postArray);


  // getPostLikes();

  // AUTO DOWNLOAD CSV FILE

  function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV(postArray);

    if (csv == null) return;

    filename = args.filename || 'export.csv';

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
    var result, ctr, keys, columnDelimiter, lineDelimiter, object;

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

    console.log(data)
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
  return result;
  }
