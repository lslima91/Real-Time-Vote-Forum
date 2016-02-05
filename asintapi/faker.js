//create some checkouts
var faker = require("faker");
var uuid = require("uuid");
var moment = require("moment");
var r = require("rethinkdb");
var assert = require("assert");
var _ = require("underscore")._;
var async = require("async");
var fs = require("fs");

//CHANGE THIS TO BE AS YOU WANT
var SalesCount = 100;

var loadBigDataset = function(){

  var generatePosts = function(name){
    return {
      title : faker.internet.domainName,
      url : faker.internet.url,
      upvotes : faker.random.number({min : 1, max : 100}),
      author : faker.internet.userName
    }
  }

  var putToDisk = function(next){
    var path = "./drop/";

    console.log("Writing to disk...");
    console.log("Posts: ", posts.length);
    if (fs.existsSync(path) === false) {
        fs.mkdirSync(path, 0777);
    }
    fs.writeFileSync(path + "posts.json", JSON.stringify(sales));
  };

  async.series({
    salesLoaded : loadSales,
    savedToDisk : putToDisk
  }, function(err,res){
    console.log("FINISHED");
    console.log(res);
  });
}

loadBigDataset();