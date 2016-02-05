var fs = require('fs');
var faker = require("faker");

// generate bigDataSet as example
var bigSet = [];

function generatePosts(pid){
  return {
    title : faker.name.title(),
    url : faker.internet.url(),
    author : faker.internet.userName(),
    upvotes : faker.random.number({min : 1, max : 100}),
    downvotes : faker.random.number({min : 1, max : 40}),
    submited : faker.date.past(),
    comments : faker.random.number({min : 0, max : 10}),
    pid : pid
  }
}

for(i = 20; i >= 0; i--){
  var posts = generatePosts(i);
  bigSet.push(posts);
};

fs.writeFile(__dirname + '/bigDataSet.json',  JSON.stringify(bigSet), function() {
  console.log("bigDataSet generated successfully!");
});


var userSet = []

var user = {
  login: 'luis',
  email: 'j.lima91@yahoo.com',
  password: '123',
  admin: 'true',
  comments: '0',
  posts: '0'
}

userSet.push(user);

var user2 = {
  login: 'lima',
  email: 'j.lima91@yahoo.com',
  password: '123',
  admin: 'true',
  comments: '0',
  posts: '0'
}

userSet.push(user2);

fs.writeFile(__dirname + '/userDataSet.json',  JSON.stringify(userSet), function() {
  console.log("userDataSet generated successfully!");
});
