var facebookKey = config.FACEBOOK_KEY;

// FIND ALL POST DATA FOR DOJOAPP FACEBOOK PAGE

$(document).ready(function() {
  getPostLikes = function() {
    $.get("https://graph.facebook.com/v2.8/thedojoapp?fields=posts%7Blikes%7Bid%7D%7D&access_token=" + facebookKey,function (data) {
      var postArray = data.posts.data;

      // Seperate posts by ID
      // postArray.forEach(function(singlePost) {
      //   console.log(singlePost);
      // })
      // console.log(postArray)
      // console.log(convertArrayOfObjectsToCSV(postArray));

      // console.log(postArray);
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
    result += keys.reverse().join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
      // ctr = 0;
      // console.log(ctr + ' before');
      // keys.forEach(function(key) {
      //   ctr = 0;
      //   item.likes.data.forEach(function(ele) {
      //     result += ele.id;
      //     ctr += 1;
      //     console.log(ctr + ' during');
      //     if (ctr > 0) result += columnDelimiter;
      //     result += item[key];
      //     // ctr += 1;
      //     result += lineDelimiter;
      //   });
      //   console.log(ctr + ' after')
      //   result += "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      //   result += lineDelimiter;
      // });
      item.likes.data.forEach(function(like) {
        result += like.id + columnDelimiter + item.id + lineDelimiter;
      })
    });
    console.log(result);
    return result;
  }
})
