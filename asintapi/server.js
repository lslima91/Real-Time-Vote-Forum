var express = require('express');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var async = require('async');
// var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var app = express();
var cors = require('cors')

var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
io.adapter(redis({ host: '10.1.37.19', port: 6379 }));

var config = require(__dirname+"/rethinkconfig.js")

app.use(cors());

app.get('/', function (req, res) {
  res.send(process.env.APPNAME);
});

//app.use(express.static(__dirname + '/apidocs')); // Serve static content

// startExpress();
http.listen(config.express.port, function(){
    console.log('Listening on port '+config.express.port);
});


// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Parse data sent to the server
app.use(createConnection); // Create a RethinkDB connection

/*emit comments changes*/
r.connect(config.rethinkdb).then(function(conn) {
    this.conn = conn;
    return r.table("comments").changes().run(conn).then(function(cursor) {
      cursor.each(function(err, item) {
        console.log(item);
        io.emit('commentstream', item);
      });
    })
  }).error(function(err) { console.log("Failure:", err); })

/*emit posts changes*/
r.connect(config.rethinkdb).then(function(conn) {
    this.conn = conn;
    return r.table("posts").changes().run(conn).then(function(cursor) {
      cursor.each(function(err, item) {
        console.log(item);
        io.emit('poststream', item);
      });
    })
  }).error(function(err) { console.log("Failure:", err); })

/*Routes*/
var apiRoutes = express.Router();

/*unprotected routes*/
apiRoutes.route('/authenticate').post(authentication);
apiRoutes.route('/posts').get(getPosts); //ok
apiRoutes.route('/users/:login').put(createUser); //ok
apiRoutes.route('/comments/:pid').get(getComments) //ok

/*route middleware to verify token*/
apiRoutes.use(verifytoken);

/*protected routes*/
apiRoutes.route('/comments/:pid').put(createComment); //ok
apiRoutes.route('/posts').post(createPost); //ok
apiRoutes.route('/posts/:pid/upvotes').post(upvotesPost);
apiRoutes.route('/posts/:pid/downvotes').post(downvotesPost);

apiRoutes.route('/upvote/:id').post(upvotePost);
apiRoutes.route('/downvote/:id').post(downvotePost);
apiRoutes.route('/undoupvote/:id').post(undoupvotePost);
apiRoutes.route('/undodownvote/:id').post(undodownvotePost);

/*scoped routes*/
  /*delete*/
apiRoutes.route('/users/:login').delete(check_scopes(['delete']),deleteUser); 
apiRoutes.route('/comments/:pid/:id').delete(check_scopes(['delete']),deleteComment); //redo
  /*read*/
apiRoutes.route('/users').get(check_scopes(['read']),getallUsers)
apiRoutes.route('/users/:login').get(check_scopes(['read']),checkUser);

/*mount apiRoutes with /api prefix*/
app.use('/api',apiRoutes);

app.use(closeConnection); // Close the RethinkDB connection previously opened

/*TODO ERROR HANDLING*/
// .error(handleError(res))
    // .finally(next);

function createConnection(req, res, next) {
    r.connect(config.rethinkdb).then(function(conn) {
        // Save the connection in `req`
        req._rdbConn = conn;
        // Pass the current request to the next middleware
        next();
    }).error(handleError(res));
}

function handleError(res) {
    return function(error) {
        res.status(500).send({code: 500, message: error.message});
    }
}

function getPosts(req, res, next) {
    //console.log(req.url);
    //console.log(req.query.api_key);
    // console.log(req.headers);
    // r.table('posts').orderBy(r.desc('upvotes')).run(req._rdbConn).then(function(cursor) {
    r.table('posts').orderBy(r.asc('pid')).run(req._rdbConn).then(function(cursor) {
        return cursor.toArray();
    }).then(function(result) {
        res.send(JSON.stringify(result));
    })
}

function getComments(req, res, next) {
    console.log(req.url);
    r.table('comments').getAll(req.params.pid,{index:'pid'}).orderBy(r.desc('time')).run(req._rdbConn).then(function(cursor) {
        return cursor.toArray();
    }).then(function(result) {
        console.log(result);
        res.send(JSON.stringify(result));
    })
}

function getPostsStream(conn) {
    var results=[];
    r.table("posts").changes().run(conn).then(function(cursor) {
      cursor.each(function(err, item) {
        console.log(item);
        io.emit('stream', item);
        // results.push(item);
      });
    }).error(function(err) {
      console.log("Error:", err);
    });
}

function createPost(req, res, next) {
    console.log(req.url);
    /*cl side*/
    var post = req.body;
    post.author = req.decoded.login;
    /*sv side*/
    post.submited = r.now(); /*current time*/
    post.upvotes = 0; post.downvotes = 0; post.comments = 0;

    async.parallel([
        function(){
            r.table('posts').count().run(req._rdbConn).then(function(result){
                /*next pid*/
                post.pid = result;

                r.table('posts').insert(post, {returnChanges: true}).run(req._rdbConn).then(function(result) {
                if (result.inserted !== 1) {
                    handleError(res, next)(new Error("Document was not inserted.")); 
                }
                else {
                    // res.send(JSON.stringify(result.changes[0].new_val));
                    console.log(`${req.url}/${post.pid}`);
                    res.json({code: 201, location:`${req.url}/${post.pid}`});
                }
                })
            })
        },
        /*query2*/
        function(){
            /*actualizar votelists*/
            console.log('updating lists...');
            r.table('users').update(function(user) {
              return {
                upvotelist: user('upvotelist').append(0),
                downvotelist: user('downvotelist').append(0)};
            }).run(req._rdbConn)
        }
        ],null)
}

function createComment(req, res, next){
  console.log(req.url);
    var data = req.body;
    data.pid = req.params.pid;
    data.author = req.decoded.login;
    data.time = r.now();

    r.table('comments').insert(data, {returnChanges: true}).run(req._rdbConn).then(function(result){
        if (result.inserted !== 1) {
            handleError(res, next)(new Error("Document was not inserted.")); 
        }
        else {
            // res.header('Access-Control-Allow-Origin','localhost:3000');
            res.send(JSON.stringify(result.changes[0].new_val));
        }
    })
}


function createUser(req,res,next){
  var user = req.body;
  user.login = req.params.login;
  user.admin = 'false';
  user.comments = 0;
  user.posts = 0;

  console.log('req.body ->');
  console.log(req.body);
  //email, login, password (body)
  // user.email = req.body.email;
  // user.login = req.body.login;
  // user.password = req.body.password;

  r.table('users').filter(r.row('login').eq(req.params.login)).run(req._rdbConn)
    .then(function(cursor){
      return cursor.toArray()
    })
    .then(function(result){
      /*user exists*/
      if(result.length!==0){
        res.json({ success: false, message: 'This user already exists.' });
      /*username is free*/
      }else{
        console.log('username nao existe');
        /*numPosts*/
        r.table('posts').count().run(req._rdbConn).then(function(result){
          console.log(result);
          user.upvotelist = Array(result+1).join('0').split('').map(parseFloat);
          user.downvotelist = Array(result+1).join('0').split('').map(parseFloat);

          r.table('users').insert(user, {returnChanges: true}).run(req._rdbConn).then(function(result){
            if(result.inserted !== 1){
              handleError(res, next)(new Error("Document was not inserted.")); 
            }else{
              // res.header('Access-Control-Allow-Origin','localhost:3000');
              res.json({
                success: true, 
                message: 'Created User.',
                payload: result.changes[0].new_val
              })
            }
          })
        }); 
      }
    })
}

function deleteMe(){
    if(req.params.login!==req.decoded.login){
    res.json({ success: false, message: 'You can only delete yourself!' });
    next();
  } 
}

function deleteUser(req, res, next){
  console.log(req.url);

  r.table('users').filter(r.row('login').eq(req.params.login)).run(req._rdbConn)
    .then(function(cursor){
      return cursor.toArray()
    })
    .then(function(result){
      if(result.length===0){
        res.json({ success: false, message: 'User does not exist!'});
      }else{
        console.log('VOU FAZER DELETE');
        r.table('users').filter(r.row('login').eq(req.params.login)).delete().run(req._rdbConn).then(function(result){
          res.json({ success: true, message: 'User deleted!' });
        })
      }    
     })
}

function deleteComment(req, res, next){
  console.log(req.url);
  r.table('comments').get(req.params.id).run(req._rdbConn)
    .then(function(result){
      if(result===null){
        res.json({ success: false, message: 'Bad comment id'});
      }else{
        r.table('comments').get(req.params.id).delete().run(req._rdbConn).then(function(result){
          res.json({ success: true, message: 'Comment deleted!' });
        })
      }
    })
}


function upvotesPost(req,res,next){

  r.table('users').filter(r.row('login').eq(req.decoded.login)).pluck('upvotelist')
    .concatMap(function(result){
      return result('upvotelist')
    }).run(req._rdbConn)
    .then(function(cursor){
      return cursor.toArray()
    })

    /*query2*/
    .then((result)=>{
      var upvote = result[req.params.pid]===0;

       /*___Undo Upvote___*/
        if(upvote===false){
         r.table('posts').filter(function(post){
          return post('pid').eq(parseInt(req.params.pid));
         })
          .update({"upvotes": r.row("upvotes").sub(1)}).run(req._rdbConn)
          .then((result)=>{
            /*query 3*/
            r.table('users').filter(r.row('login').eq(req.decoded.login))
            .update({upvotelist: r.row('upvotelist').changeAt(parseInt(req.params.pid),0)})
            .run(req._rdbConn).then(()=>{
              res.json(result);
            })
         })            

      /*___Upvote___*/
        }else{
          r.table('posts').filter(function(post){
           return post('pid').eq(parseInt(req.params.pid));
          }).update({"upvotes": r.row("upvotes").add(1)}).run(req._rdbConn)
          .then((result)=>{
            /*query 3*/
              r.table('users').filter(r.row('login').eq(req.decoded.login))
              .update({upvotelist: r.row('upvotelist').changeAt(parseInt(req.params.pid),1)})
              .run(req._rdbConn).then(()=>{
              res.json(result);
            })
          })
         
      }
    })
}

function downvotesPost(req,res,next){

  r.table('users').filter(r.row('login').eq(req.decoded.login)).pluck('downvotelist')
    .concatMap(function(result){
      return result('downvotelist')
    }).run(req._rdbConn)
    .then(function(cursor){
      return cursor.toArray()
    })

    /*query2*/
    .then((result)=>{
      var upvote = result[req.params.pid]===0;

       /*___Undo Upvote___*/
        if(upvote===false){
         r.table('posts').filter(function(post){
          return post('pid').eq(parseInt(req.params.pid));
         })
          .update({"downvotes": r.row("downvotes").sub(1)}).run(req._rdbConn)
          .then((result)=>{
            /*query 3*/
            r.table('users').filter(r.row('login').eq(req.decoded.login))
            .update({downvotelist: r.row('downvotelist').changeAt(parseInt(req.params.pid),0)})
            .run(req._rdbConn).then(()=>{
              res.json({code: 200, operations: result});
            })
         })            

      /*___Upvote___*/
        }else{
          r.table('posts').filter(function(post){
           return post('pid').eq(parseInt(req.params.pid));
          }).update({"downvotes": r.row("downvotes").add(1)}).run(req._rdbConn)
          .then((result)=>{
            /*query 3*/
              r.table('users').filter(r.row('login').eq(req.decoded.login))
              .update({downvotelist: r.row('downvotelist').changeAt(parseInt(req.params.pid),1)})
              .run(req._rdbConn).then(()=>{
              res.json({code: 200,operations: result});
            })
          })
         
      }
    })
}

function upvotePost(req,res,next){
    async.parallel([
      /*query 1*/
      function(){
        r.table('posts').filter(function(post){
          console.log(req.url);
          return post('pid').eq(parseInt(req.params.id));
        }).update({"upvotes": r.row("upvotes").add(1)}).run(req._rdbConn).then(function(result){
            res.send(JSON.stringify(result));
        })
      },
      /*query 2*/
      function(){
        r.table('users').filter(r.row('login').eq(req.decoded.login))
        .update({upvotelist: r.row('upvotelist').changeAt(parseInt(req.params.id),1)})
        .run(req._rdbConn)
      }
      ], null);
}

function downvotePost(req,res,next){
     async.parallel([
      /*query 1*/
      function(){
        r.table('posts').filter(function(post){
          console.log(req.url);
          return post('pid').eq(parseInt(req.params.id));
        }).update({"downvotes": r.row("downvotes").add(1)}).run(req._rdbConn)
      },
      /*query 2*/
      function(){
        r.table('users').filter(r.row('login').eq(req.decoded.login))
        .update({downvotelist: r.row('downvotelist').changeAt(parseInt(req.params.id),1)})
        .run(req._rdbConn).then(function(result){
            console.log(result);
            res.send(JSON.stringify(result));
        })
      }
      ], null);
}

function undoupvotePost(req,res,next){
   async.parallel([
      /*query 1*/
      function(){
        r.table('posts').filter(function(post){
          console.log(req.url);
          return post('pid').eq(parseInt(req.params.id));
        }).update({"upvotes": r.row("upvotes").sub(1)}).run(req._rdbConn)
      },
      /*query 2*/
      function(){
        r.table('users').filter(r.row('login').eq(req.decoded.login))
        .update({upvotelist: r.row('upvotelist').changeAt(parseInt(req.params.id),0)})
        .run(req._rdbConn).then(function(result){
            console.log(result);
            res.send(JSON.stringify(result));
        })
      }
      ], null);
}

function undodownvotePost(req,res,next){
     async.parallel([
      /*query 1*/
      function(){
        r.table('posts').filter(function(post){
          console.log(req.url);
          return post('pid').eq(parseInt(req.params.id));
        }).update({"downvotes": r.row("downvotes").sub(1)}).run(req._rdbConn)
      },
      /*query 2*/
      function(){
        r.table('users').filter(r.row('login').eq(req.decoded.login))
        .update({downvotelist: r.row('downvotelist').changeAt(parseInt(req.params.id),0)})
        .run(req._rdbConn).then(function(result){
            console.log(result);
            res.send(JSON.stringify(result));
        })
      }
      ], null);
}


/*requires special access*/
function checkUser(req,res,next){
   console.log(req.url);
   r.table('users').filter(r.row('login').eq(req.params.login)).run(req._rdbConn)
   .then(function(cursor) {
        return cursor.toArray()})
    .then(function(result) {
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    })
}

function getallUsers(req,res,next){
  console.log('getAllUsers');
  console.log(req.url);
  r.table('users').orderBy(r.asc('login')).run(req._rdbConn)
    .then(function(cursor) {
        return cursor.toArray();
    }).then(function(result) {
        res.send(JSON.stringify(result));
    })
}

function authentication(req,res,next){
    // find the user in db
    console.log(req.url);
    console.log(req.body);
    r.table('users').filter(r.row('login').eq(req.body.login)).run(req._rdbConn)
    .then(function(cursor) {
        return cursor.toArray()})
    .then(function(result){
        if(result.length===0){
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }else{
            // comparePassword(res,user,req.body.password, user.password, issueToken);
            if(result[0].password != req.body.password){
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            }else{
                console.log('RESULT');
                console.log(result);
                var user = {
                    login: req.body.login,
                }

                var payload = {
                    login: req.body.login,
                    scopes: ['read','delete']
                }

                var token = jwt.sign(payload, 'AsintSecret', {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.json({
                  success: true,
                  message: 'Enjoy your token!',
                  token: token,
                  payload: result
                });;
            }
        }
    })
}
function verifytoken(req,res,next){
   console.log('VerifyToken function');
    console.log(req.url);
   // console.log(req.params);
	// console.log(req.query);
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.api_key || req.headers['authorization'];
   console.log(token);
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'AsintSecret', function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        console.log('REQ Decoded');
        console.log(req.decoded); 
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        code: 403, 
        message: 'No token provided.' 
    });    
  }
}

// function comparePassword(res,user,password, userPassword, callback) {
//    bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
//       if (err) throw err;
//       return callback(res, user, isPasswordMatch);
//    });
// };

// function cryptPassword(req, res, callback){

//   bcrypt.genSalt(10, function(err, salt){
//     if (err) throw err;

//     bcrypt.hash(req.body.password, salt, function(err, hash) {
//       if (err) throw err;
//       return callback(req,res, salt, hash);
//     });

//   });
// };

function check_scopes(scopes) {
  return function(req, res, next) {
  console.log('CHECKING MA SCOPES');

    //
    // check if any of the scopes defined in the token,
    // is one of the scopes declared on check_scopes
    //
    var token = req.decoded;
    console.log('token in scopes');
    console.log(scopes);
    console.log(token);
    for (var i =0; i<token.scopes.length; i++){
      for (var j=0; j<scopes.length; j++){
          if(scopes[j] === token.scopes[i]) return next();
      }
    }

    return res.status(401).send({code: 401, message: 'insufficient scopes'});
  }
}


function closeConnection(req, res, next) {
    req._rdbConn.close();
    next();
}

function startExpress() {
    app.listen(config.express.port);
    //socket listener
    // var io = sockio.listen(app.listen(config.express.port), {log: false});
    console.log('Listening on port '+config.express.port);
}
