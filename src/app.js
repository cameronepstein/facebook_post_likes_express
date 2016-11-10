var facebookKey = config.FACEBOOK_KEY;

// ASSIGN QUERY TO VARIABLE

var likePage = getQueryVariable("likePage");

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

console.log(likePage);

// FIND DATA FOR DOJOAPP FACEBOOK PAGE POSTS SINCE 1078649600

$(document).ready(function() {
  getPostLikes = function(response) {
    $.get("https://graph.facebook.com/v2.8/" + likePage + "?fields=access_token,posts.since(1078649600){likes{id}}&access_token=" + facebookKey,function (data) {
        var postArray = []
        postArray.push(data.posts.data);
        data.posts.paging.next;

        // AUTO-DOWNLOAD CSV FILE ON DOCUMENT READY

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
      console.log('ey')
    });
  };
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
