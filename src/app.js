var facebookKey = config.FACEBOOK_KEY;

// var fs = require('fs');
// var path = require('path')

// IMPORT MODULES

// ASSIGN QUERY TO VARIABLE

var likePage = getQueryVariable('likePage');
var sinceDate = getQueryVariable('sinceDate');

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
  getPostLikes = function(response) {
    $.get('https://graph.facebook.com/v2.8/'+ likePage + '?fields=access_token,posts.since(' + sinceDate + '){likes{id}}&access_token=' + facebookKey, function (facebookData) {

        var likePageId = facebookData.id;
        var postArray = [];
        var testArray = [];
        var check = 0;

        var currentDataLength = ' ';
        var i = 0;

          // if (facebookData.hasOwnProperty('posts')) {
          //   postArray.push(facebookData.posts.data);
          //   var postData = facebookData.posts.data;
          //   postData.forEach(function(item) {
          //     console.log(item.likes)
          //     if ('paging' in item.likes) {
          //       // var nexLikePage = item.likes.paging.next;
          //       do {
          //         $.ajax({
          //           async: false,
          //           type: "GET",
          //           url: item.likes.paging.next,
          //           success: function(nextLikePageData) {
          //             if ('paging' in nextLikePageData) {
          //               nextLikePage = nextLikePageData.paging.next;
          //             }
          //             currentDataLength = nextLikePageData.data.length;
          //             console.log(currentDataLength);
          //           }
          //         });
          //       } while (currentDataLength > 0);
          //       testArray.forEach(function(element) {
          //         postArray.push(element);
          //       })
          //     }
          //   });
          // }

          function paginateThrough(type) {
            if ('paging' in type) {
              var nextPage = type.paging.next;
              console.log('new page available');
              do {
                $.ajax({
                  async: false,
                  type: 'GET',
                  url: nextPage,
                  success: function(nextPageData) {
                    console.log('New Page Accessed: ' + nextPage)
                    i++;
                    console.log('Page Number: ' + i)
                    testArray.push(nextPageData.data);
                    if ('paging' in nextPageData) {
                      nextPage = nextPageData.paging.next;
                      console.log('next page assigned');
                    }
                    currentDataLength = nextPageData.data.length;
                    console.log(currentDataLength);
                  }
                });
                console.log('DATA LENGTH: ' + currentDataLength);
              } while (currentDataLength > 0);
              testArray.forEach(function(element) {
                postArray.push(element);
              });
            } else {
              console.log('ERROR: No Data Since: ' + sinceDate);
            }
          }

          paginateThrough(facebookData.posts);

        //   if ('paging' in facebookData.posts) {
        //     var nextPage = facebookData.posts.paging.next;
        //     console.log('new page available');
        //     do {
        //       $.ajax({
        //         async: false,
        //         type: 'GET',
        //         url: nextPage,
        //         success: function(nextPageData) {
        //           console.log('New Page Accessed: ' + nextPage)
        //           i++;
        //           console.log('Page Number: ' + i)
        //           testArray.push(nextPageData.data);
        //           if ('paging' in nextPageData) {
        //             nextPage = nextPageData.paging.next;
        //             console.log('next page assigned');
        //           }
        //           currentDataLength = nextPageData.data.length;
        //           console.log(currentDataLength);
        //         }
        //       });
        //       console.log('DATA LENGTH: ' + currentDataLength);
        //     } while (currentDataLength > 0);
        //     testArray.forEach(function(element) {
        //       postArray.push(element);
        //     });
        //   } else {
        //   console.log('ERROR: No Facebook Posts Since: ' + sinceDate);
        // }


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
  console.log('Downloading...')
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
    result += 'user_id' + columnDelimiter + ' post_id' + columnDelimiter + ' page_id';
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
