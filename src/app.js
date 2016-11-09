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
      // console.log(postArray);

      convertArrayOfObjectsToCSV(postArray);
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
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
      ctr = 0;
      keys.forEach(function(key) {
        if (ctr > 0) result += columnDelimiter;
        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    console.log(result);
    return result;
    }
  })
