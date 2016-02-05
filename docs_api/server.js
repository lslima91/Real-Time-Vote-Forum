var express = require('express');
var path = require ('path');
var app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(req,res) {
  res.render('index.html');
});

app.listen(3000);
console.log('listening on port 3000');

