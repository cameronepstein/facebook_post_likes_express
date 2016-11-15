// var exports = module.exports {};
//
// exports.sayHello = function() {
//   console.log('HELLO FROM DATAFINDER MODULE!')
// }

var sayHello = {
  'one' : function() {
    console.log('HELLO FROM DATAFINDER MODULE!')
  }
}

// exports.getPostLikes = function(response) {
//   $.get("https://graph.facebook.com/v2.8/"+ likePage + "?fields=access_token,posts.since(" + sinceDate + "){likes{id}}&access_token=" + facebookKey, function (facebookData) {
//
//       var likePageId = facebookData.id;
//       var postArray = [];
//       var testArray = [];
//       var nextPage = facebookData.posts.paging.next;
//       var check = 0;
//
//       postArray.push(facebookData.posts.data);
//
//       var currentDataLength = " "
//       var i = 0
//       if ('paging' in facebookData.posts) {
//         console.log("new page available");
//         do {
//           $.ajax({
//             async: false,
//             type: "GET",
//             url: nextPage,
//             success: function(nextPageData) {
//               console.log("New Page Accessed: " + nextPage)
//               i++;
//               console.log("Page Number: " + i)
//               testArray.push(nextPageData.data);
//               if ('paging' in nextPageData) {
//                 nextPage = nextPageData.paging.next;
//                 console.log("next page assigned");
//               }
//               currentDataLength = nextPageData.data.length;
//               console.log(currentDataLength);
//             }
//           });
//           console.log("DATA LENGTH: " + currentDataLength);
//         } while (currentDataLength > 0);
//         testArray.forEach(function(element) {
//           postArray.push(element);
//         });
//       }
