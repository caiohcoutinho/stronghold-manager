var express = require('express');
var app = express();
const path = require('path');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

const port = process.env.PORT || 8080

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
