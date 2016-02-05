var express = require('express');
var path = require('path');
var port = 3000;

var app = express();


app.use(express.static(__dirname + '/')); // Serve static content

app.get('/', function (req, res) {
  console.log('APPNAME');
  console.log(process.env.APPNAME);
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(port, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port);
  }
});
