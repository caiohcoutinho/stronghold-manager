var express = require('express');
var app = express();
const path = require('path');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static/components/landing/landing.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
