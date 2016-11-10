var facebookKey = config.FACEBOOK_KEY;

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

console.log("Page Search: " + likePage);
console.log("Since: " + sinceDate)

// FIND DATA FOR DOJOAPP FACEBOOK PAGE POSTS SINCE 1078649600

$(document).ready(function() {
  getPostLikes = function(response) {
    $.get("https://graph.facebook.com/v2.8/" + likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey,function (facebookData) {
        // while (data.posts.paging.next !== 'undefined') {
        var postArray = [];
        var nextPage = facebookData.posts.paging.next;
        console.log(facebookData.posts.data[0]);
        console.log(facebookData.posts.paging.include(next))
        var check = 0;

        postArray.push(facebookData.posts.data);

        do {
          $.get(nextPage, function(nextPageData) {
            postArray.push(nextPageData.data);
            nextPage = nextPageData.paging.next;
            console.log(nextPageData.data[0]);
          });
        } while (facebookData.posts.data.length == 0); //FIX THIS WHILE LOOOOOOOOOOOOPP CONDITION!!!!!!!!!!!

        // ----------!
        // getNextPagePostLikes = function (response) {
        //   $.get(nextPage, function(nextPageData) {
        //     for (var i = 0; i < nextPageData.data.length; i++) {
        //       console.log(nextPageData.data.posts.data)
        //       postArray.push(nextPageData.posts.data);
        //     }
        //     console.log(nextPageData)
        //     if (nnextPageData.paging && nnextPageData.paging.next) {
        //       getNextPagePostLikes(nextPageData.paging.next);
        //     } else {}
        //     console.log("no more items");
        //   });
        // }
        // getNextPagePostLikes();
        //-------------!
        // console.log(data)
        // while (data.posts.paging.next.length != 0) {
        // while (data.posts/data.length != 0) {
        //  while (data.posts.paging.hasOwnProperty('next') && check < 5) {
        // ----------- Old Try
        // searchNextPage = function(response) {
        //   $.get(nextPage, function (data) {
        //     console.log(data);
        //     postArray.push(data.posts.data);
        //     nextPage = data.posts.paging.next;
        //   });
        //   // console.log(nextPage);
        //   check += 1;
        // };
        // searchNextPage();
        // -----------------------
        // };
        // while (indexOf(paging) !== []) {
        // }
        // AUTO-DOWNLOAD CSV FILE ON DOCUMENT READY
      // console.log(data.posts.data.length)
      // while (data.posts.data != [] ) {
      //   $.get(nextPage, function(nextPageData) {
      //     postArray.push(data.posts.data);
      //     nextPage = data.posts.paging.next;
      //     // console.log(nextPagedata.posts)
      //   });
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
        var likeArray = post.likes
        likeArray.data.forEach(function(like) {
          result += like.id + columnDelimiter + post.id.split('_').reverse() + lineDelimiter;
        })
      })
    });

    return result;
  }
})
