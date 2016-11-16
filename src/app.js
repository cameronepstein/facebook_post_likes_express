var facebookKey = config.FACEBOOK_KEY;

// IMPORT MODULES

// ASSIGN QUERY TO VARIABLE

var likePage = getQueryVariable("likePage");
var sinceDate = getQueryVariable("sinceDate");

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

function nextPageLikesChecker(facebookData) {
  if ('paging' in facebookPageData.data) { // IF THE NEW PAGE HOLDS A 'PAGING SECTION'
  if ('next' in facebookPageData.data.paging) {
    // console.log('gots pages!')
    nextPage = facebookPageData.paging.next; // NEXT PAGE IS REASSIGNED TO THE NEW URL
    console.log('NEXT PAGE REASSIGNED');
    }
  } else (console.log('No more pages of data'));
}


console.log("Page Search: " + likePage);
console.log("Since: " + sinceDate)

// FIND DATA FOR DOJOAPP FACEBOOK PAGE POSTS SINCE CHOSEN DATE

$(document).ready(function() {
  getPostLikes = function(response) {
    $.get("https://graph.facebook.com/v2.8/"+ likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey, function (facebookData) {

        var likePageId = facebookData.id;
        var postArray = [];
        var postIdArray = [];
        var testArray = [];
        var check = 0;

        if (facebookData.hasOwnProperty('posts')) {
          facebookData.posts.data.forEach(function(post) { // FOR EACH POST
            // testArray.push(post.id); //THIS SAVES THE POST ID TO AN ARRAY
            if ('likes' in post) { // IF THERES LIKES IN THE POST
              if ('paging' in post.likes) { // If there's more than one page of LIKES
                post.likes.data.forEach(function(like) { // FOR EACH LIKE
                  testArray.push(like.id + ' ' + post.id); // ADD LIKE ID + POST ID TO THE TEST ARRAY
                });
                nextPage = post.likes.paging.next; // NEXT PAGE = URL TO NEXT PAGE FOUND IN PAGING SECTION
                var i = 0;
                do {
                  $.get({ // MAKE AJAX REQUEST TO NEW PAGE
                    url: nextPage,
                    success: function paginateAndSaveLikes(newPageData) { // ON SUCCESS....
                      console.log('ajax request successful')
                      // console.log(newPageData)
                      newPageData.data.forEach(function pushToTestArray(like) {  // FOR EACH LIKE
                        testArray.push(like.id + ' ' + post.id); // SEND LIKE ID AND POST ID TO THE TEST ARRAY
                      }, nextPageLikesChecker(like));
                      // console.log(newPageData);
                      // function nextPageChecker() {
                      //   if ('paging' in newPageData.data) { // IF THE NEW PAGE HOLDS A 'PAGING SECTION'
                      //   if ('next' in newPageData.data.paging) {
                      //     // console.log('gots pages!')
                      //     nextPage = newPageData.paging.next; // NEXT PAGE IS REASSIGNED TO THE NEW URL
                      //     console.log('NEXT PAGE REASSIGNED')
                      //     }
                      //   }
                      // }
                      currentDataLength = newPageData.data.length;
                      console.log('CURRENT DATA LENGTH! ' + currentDataLength)
                      console.log(i);
                    },
                  });
                  i += 1;
                } while (currentDataLength != 0 && i < 5);
              }
              console.log(post.likes)
            }
          })
          postArray.push(facebookData.posts.data);

          var currentDataLength = " "
          var i = 0

      //     postArray.forEach(function(item) {
      //      item.forEach(function(post) {
      //        if ('paging' in post.likes) {
      //          var nextPage = post.likes.paging.next;
      //          do {
      //            $.ajax({
      //              async: false,
      //              type: 'GET',
      //              url: nextPage,
      //              success: function(nextPageData) {
      //                console.log("loop: " + j);
      //                testArray.push(nextPageData.data);
      //                if (typeof nextPageData === 'object') {
      //                  console.log(nextPageData);
      //                  if ('paging' in nextPageData.data) {
      //                    nextPage = nextPageData.paging.next;
      //                  } else {
      //                    test = 0;
      //                  }
      //                  console.log(nextPageData)
      //                  currentDataLength = nextPageData.data.length;
      //                  currentData = nextPageData.data;
      //                  j+=1;
      //                }
      //              },
      //            });
      //            console.log(currentDataLength);
      //          } while (test != 0);
      //          testArray.forEach(function(element) {
      //            postArray.push(element);
      //          });
      //        } else {
      //          // console.log('ERROR: No Facebook Posts Since: ' + sinceDate);
      //        }
      //      });
      //    });
      //  }


          if ('paging' in facebookData.posts) {
            var nextPage = facebookData.posts.paging.next;
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
                  testArray.push(nextPageData.data);
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
            testArray.forEach(function(element) {
              postArray.push(element);
            });
          }
        } else {
          console.log('ERROR: No Facebook Posts Since: ' + sinceDate);
        }


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
      var convertedPostCSV = convertArrayOfObjectsToCSV(postArray);
      downloadCSV(convertedPostCSV);
    });
  };
  console.log("Downloading...")
  getPostLikes();

  // CONVERT FACEBOOK POSTS OBJECTS TO CSV FORMAT

  function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

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
  return result;
  }
})
