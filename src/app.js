var facebookKey = config.FACEBOOK_KEY;

// IMPORT MODULES

// ASSIGN QUERY TO VARIABLE

var likePage = getQueryVariable("likePage");
var sinceDate = getQueryVariable("sinceDate");
var postArray = [];
var testArray = [];

$(document).ready(function() {
  populatePostArray("https://graph.facebook.com/v2.8/"+ likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey, checkPostArray());
});

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

function checkPostArray() {
  console.log(postArray);
}

function nextPageLikesChecker(facebookPageData) {
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

// getPostLikes = function(page, callback) {
//   $.get(page, function (facebookData) {
//
//     var likePageId = facebookData.id;
//
//     var testArray = [];
//     var check = 0;
//
//     if (facebookData.hasOwnProperty('posts')) {
//       facebookData.posts.data.forEach(function(post) { // FOR EACH POST
//         // testArray.push(post.id); //THIS SAVES THE POST ID TO AN ARRAY
//         if ('likes' in post) { // IF THERES LIKES IN THE POST
//           if ('paging' in post.likes) { // If there's more than one page of LIKES
//           post.likes.data.forEach(function(like) { // FOR EACH LIKE
//             testArray.push(like.id + ' ' + post.id); // ADD LIKE ID + POST ID TO THE TEST ARRAY
//           });
//           nextPage = post.likes.paging.next; // NEXT PAGE = URL TO NEXT PAGE FOUND IN PAGING SECTION
//           console.log(nextPage)
//           console.log('next page assigned')
//           var i = 0;
//           do {
//             $.get({ // MAKE AJAX REQUEST TO NEW PAGE
//               url: nextPage,
//               success: function paginateAndSaveLikes(newPageData) { // ON SUCCESS....
//                 console.log('ajax request successful')
//                 // console.log(newPageData.data)
//                 if ('data' in newPageData) { // IF THERES LIKES IN THE POST
//                   if ('paging' in post.likes) { // If there's more than one page of LIKES
//                   post.likes.data.forEach(function(like) { // FOR EACH LIKE
//                     testArray.push(like.id + ' ' + post.id); // ADD LIKE ID + POST ID TO THE TEST ARRAY
//                   });
//                   nextPage = post.likes.paging.next;
//                 // newPageData.data.forEach(function pushToTestArray(like) {  // FOR EACH LIKE
//                 //   testArray.push(like.id + ' ' + post.id); // SEND LIKE ID AND POST ID TO THE TEST ARRAY
//                 // }, nextPageLikesChecker(newPageData));
//                 // console.log(newPageData);
//                 // function nextPageChecker() {
//                 //   if ('paging' in newPageData.data) { // IF THE NEW PAGE HOLDS A 'PAGING SECTION'
//                 //   if ('next' in newPageData.data.paging) {
//                 //     // console.log('gots pages!')
//                 //     nextPage = newPageData.paging.next; // NEXT PAGE IS REASSIGNED TO THE NEW URL
//                 //     console.log('NEXT PAGE REASSIGNED')
//                 //     }
//                 //   }
//                 // }
//                 currentDataLength = newPageData.data.length;
//                 // console.log('CURRENT DATA LENGTH! ' + currentDataLength)
//                 // console.log('CURRENT DATA: ' + newPageData.data);
//               }
//             };
//             i += 1;
//           } while (currentDataLength > 0 && i < 5);
//         }
//         // console.log(post.likes)
//       }
//     })
//     // testArray.forEach(function(item) {
//     //   postArray.push(item);
//     // })
//     postArray.push(testArray);
//     var currentDataLength = " "
//     var i = 0
//   }
// })
// console.log(callback)
// }

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
    // console.log(item)
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
function populatePostArray(page) {

  i = 0;

  $.get(page, function (facebookData) {
    console.log(facebookData.posts)
    postArray.push(facebookData.posts)
    if ('paging' in facebookData.posts) {
      var nextPage = facebookData.posts.paging.next;
      do {
        $.ajax({
          async: false,
          type: "GET",
          url: nextPage,
          success: function(nextPageData) {
            console.log("New Page Accessed: " + nextPage)
            i++;
            console.log("Page Number: " + i)
            console.log(nextPageData)
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
    } else {
      console.log('ERROR: No Facebook Posts Since: ' + sinceDate);
    }
  });
}
        //

      // AUTO DOWNLOAD CSV FILE

  // CONVERT FACEBOOK POSTS OBJECTS TO CSV FORMAT
