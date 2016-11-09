var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/index.htm', function (req, res) {
   res.sendFile(__dirname + "/" + "index.htm" );
})

app.get('/src/bundle.js', function(req, res) {
  res.sendFile(__dirname + "/" + "/src/bundle.js");
})

app.get('/src/config.js', function(req, res) {
  res.sendFile(__dirname + "/" + "/src/config.js");
})

app.get('/src/app.js', function(req, res) {
  res.sendFile(__dirname + "/" + "/src/app.js");
})

app.post('/index.htm', urlencodedParser, function (req, res) {
   // Prepare output in JSON format
   response = {
      page_name:req.body.page_name,
   };
   console.log(response);
   res.end(JSON.stringify(response));
})


var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Application listening at http://%s:%s", host, port)
})
