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

$(document).ready(function() {
  getPostLikes().then(function() {
  console.log(postArray);
  var list = pageThroughLikes(postArray);
  console.log(list)
  $.when.apply(this, list).done(function() {
    var testArray = [];
    console.log(list.length)
    if(list.length > 1) {
    $.each(arguments, function(k, v) {
        var dt = processData(v[0]);
        testArray.push(dt);
        postArray.push(testArray);
    })
    } else {
  console.log(arguments)
    console.log(arguments[0])
    var dt = processData(arguments[0]);
    testArray.push(dt);
    postArray.push(testArray);
    console.log(postArray)
    console.log(testArray)
    }
    test(postArray);
   });
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

function pageThroughLikes(facebookPostArray) {
 console.log('paging through likes')
 var testArray = []
 var promiseList = [];
 // return new Promise(function (fulfill, reject) {
   facebookPostArray.forEach(function(array) {
       array.forEach(function(innerObject) {
         if ('likes' in innerObject) {
           if ('paging' in innerObject.likes) {
             if ('next' in innerObject.likes.paging) {
               var nextPage = innerObject.likes.paging.next;
               var currentPostId = innerObject.id;
               var currentDataLength = innerObject.likes.data.length;
               var i = 0;
                 do {
                   promiseList.push(
                     $.ajax({url : nextPage
                       }).then(function(data, b, promise){
                         console.log(data)
                       data.id = currentPostId;
                       if ('paging' in data) {
                         if ('next' in data.paging) {
                           nextPage = data.paging.next;
                         }
                       }
                       var currentDataLength = data.data.length
                      //  currentDataLength = data.length
                       return promise
                       }))
                       i += 1;
                     } while (currentDataLength != 0 && i < 1)
              }
             }
           }
         })
   });
   console.log('paged through likes')
   return promiseList;
}

 processData = function(nextLikePageData){
 console.log("processing data");
 // console.log(nextLikePageData)
    likeData = {};
                  likeData.id = nextLikePageData.id;
                  likeData.likes = {};
                  likeData.likes.data = nextLikePageData.data
                  likeData.likes.paging = nextLikePageData.paging
                  // console.log(likeData);
  return likeData;
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
