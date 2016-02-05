import fetch from 'isomorphic-fetch';
import {
  REQUEST_POSTS, RECEIVE_POSTS, LOGGED_IN, LOCALE_SWITCHED, LOG_OUT, UPVOTE_POST, DOWNVOTE_POST, FAILED_LOGIN,
  REGISTER_USER, UNDO_DOWNVOTE_POST, UNDO_UPVOTE_POST, CREATE_POST, GET_STREAM_CREATE, GET_STREAM_VOTES, GET_STREAM_COMMENTS, REQUEST_COMMENTS, RECEIVE_COMMENTS
} from './../constants';
import * as storage from './../persistence/storage';

var ROOT = 'http://asintapi.lslima.me';

//Post Actions
function requestPosts() {
  return {
    type: REQUEST_POSTS,
  };
};

function receivePosts(json) {
  return {
    type: RECEIVE_POSTS,
    posts: json,
    receivedAt: Date.now()
  };
}

function upvotePost(id) {
  return {
    type: UPVOTE_POST,
    pid: id
  };
};

function undoupvotePost(id) {
  return {
    type: UNDO_UPVOTE_POST,
    pid: id
  };
};

function downvotePost(id) {
  return {
    type: DOWNVOTE_POST,
    pid: id
  };
};

function undodownvotePost(id) {
  return {
    type: UNDO_DOWNVOTE_POST,
    pid: id
  };
};

export function fetchPosts() {
  const API_CALL = `${ROOT}/api/posts`;
  return dispatch => {
    dispatch(requestPosts());
    return fetch(API_CALL)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(json)));
  };
}

export function loadPosts(){
  console.log('loadPosts');
  return (dispatch, getState) => {
    return dispatch(fetchPosts());
  };
}

export function createPost(value,login,redirect){
  console.log('create post');
  console.log(value);
  console.log(login);
  const {title, url, label} = value;
  const token = storage.get('token');
  const API_CREATE_POST = `${ROOT}/api/posts/`;
  redirect();
  return dispatch => {
     return fetch(API_CREATE_POST,
      {method: 'post', 
      headers: {'Accept': 'application/json','Content-Type': 'application/json', 'authorization': token},
      body: JSON.stringify({title: title, url: url, label: label})
      });
     // .then(dispatch(addPost(pid, title, url)));
  };
}

export function createComment(pid, user, comment){
  console.log('create comment');
  const API_CREATE_COMMENT = `${ROOT}/api/comments/${pid}`;
  const token = storage.get('token');
     return fetch(API_CREATE_COMMENT,
      {method: 'put', 
      headers: {'Accept': 'application/json','Content-Type': 'application/json', 'authorization':token},
      body: JSON.stringify({comment: comment})
      });
}

export function reqComments(pid, redirect) {
  const API_REQUEST_COMMENTS = `${ROOT}/api/comments/${pid}`;
    return dispatch => {
      dispatch(requestComments(pid));
        return fetch(API_REQUEST_COMMENTS)
          .then(response => response.json())
          .then(json => dispatch(receiveComments(pid,json)))
          .then(redirect());
  };
}

function requestComments(){
  return {
    type: REQUEST_COMMENTS
  };
}


function receiveComments(pid,json){
  return {
    type: RECEIVE_COMMENTS,
    comments : json,
    pid: pid
  };
}

export function getstreamComments(comment, pid){
      console.log('action votes');
      return {
        type: GET_STREAM_COMMENTS,
        comment: comment,
        pid: pid
      };
}

export function upvotePosts(pid,login,upvotelist){
  const API_UPVOTE = `${ROOT}/api/upvote/${pid}`;
  const token = storage.get('token');
  return dispatch => {
    return fetch(API_UPVOTE,{method: 'post',
          headers: {'Accept': 'application/json','Content-Type': 'application/json',
          'authorization': token}}).then(dispatch(upvotePost(pid)));
  };
}

export function undoupvotePosts(pid,login,upvotelist){
  const API_UNDO_UPVOTE = `${ROOT}/api/undoupvote/${pid}`;
  const token = storage.get('token');
  return dispatch => {
    return fetch(API_UNDO_UPVOTE,{method: 'post',
          headers: {'Accept': 'application/json','Content-Type': 'application/json',
          'authorization': token}}).then(dispatch(undoupvotePost(pid)));
  };
}

export function downvotePosts(pid,login,downvotelist){
  const API_DOWNVOTE = `${ROOT}/api/downvote/${pid}`;
  const token = storage.get('token');
  return dispatch => {
    return fetch(API_DOWNVOTE,{method: 'post',
          headers: {'Accept': 'application/json','Content-Type': 'application/json',
          'authorization': token}}).then(dispatch(downvotePost(pid)));
  };
}

export function undodownvotePosts(pid,login,downvotelist){
  const API_UNDO_DOWNVOTE = `${ROOT}/api/undodownvote/${pid}`;
  const token = storage.get('token');
  return dispatch => {
    return fetch(API_UNDO_DOWNVOTE,{method: 'post',
          headers: {'Accept': 'application/json','Content-Type': 'application/json',
          'authorization': token}}).then(dispatch(undodownvotePost(pid)));
  };
}

// Stream Actions
export function getstreamVotes(post){
  console.log('action votes');
  return {
    type: GET_STREAM_VOTES,
    payload: post
  };
}

export function getstreamCreate(post){
  return {
    type: GET_STREAM_CREATE,
    payload: post
  };
}

/*Login Actions*/
export function login2(json,redirect){
  if(json.token){
    redirect();
    const {login, upvotelist, downvotelist, password} = json.payload[0];
    console.log('json->');
    console.log(json);
    storage.put('token',json.token);
    storage.put('user',login);
    storage.put('pass',password);
    return {
      type: LOGGED_IN,
      token: json.token,
      user: login,
      pass: password,
      upvotelist: upvotelist,
      downvotelist: downvotelist
    }; 
  }else{
    //failed login
    alert('bad login info');  
    return {
      type: FAILED_LOGIN
    };
  }
}

export function login(user, redirect){
  const API_VALID_LOGIN = `${ROOT}/api/authenticate/`;
  return dispatch => {
    fetch(API_VALID_LOGIN,{method: 'post',
      headers: {'Accept': 'application/json','Content-Type': 'application/json'},
      body: JSON.stringify({email: user.email, login: user.login, password: user.password})
      })
      .then(response => response.json())
      .then(json => dispatch(login2(json,redirect)));
  };
}

export function logout(){
  storage.remove('token');
  storage.remove('user');
  storage.remove('pass');
  storage.remove('locale');
  return {
    type: LOG_OUT,
  };
}
/*end Login actions*/

export function checkUser(user,redirect){
  const {login, password} = user;
  console.log('checkUser'); 
  console.log(user);
  const API_VALID_LOGIN = `${ROOT}/api/checkuser/${login}`;
  var valid = false;
  console.log(API_VALID_LOGIN);
  return dispatch => {
    fetch(API_VALID_LOGIN)
      .then(response => response.json())
      .then(json => dispatch(dologin(user,json,redirect)));
  };
}

//register
export function createUser(user, redirect){
  var {login, password, email} = user;

  // const API_VALID_LOGIN = `http://yourdomain.com:4000/api/checkuser/${login}`;
  // fetch(API_VALID_LOGIN)
  //   .then(response => response.json())
  //   .then(function(json){

  //     /*no user with same login*/
  //     if(Object.keys(json).length === 0 || json[0].login !== user.login){
  //       console.log(user);

  const API_CREATE_USER =  `${ROOT}/api/users/${login}`;
  return fetch(API_CREATE_USER,
    {method: 'put', 
    headers: {'Accept': 'application/json','Content-Type': 'application/json'},
    body: JSON.stringify({email: user.email, login: user.login, password: user.password})
    }).then(response => response.json())
      .then((json) => {
        console.log('CREATE USERE RAERAEWR');
        console.log(json);         
        if(json.success) {
          alert("Registration Successfull! You can now login!");
          redirect();
        }else{
          alert("Username is already taken!");
        }
      });
}

  // return {
  //   type: REGISTER_USER,
  //   user: user
  // };

//utils
export function validLogin(user,res){
  const {login, password} = user; 
  console.log('login validation?');
  console.log(res);
  return Object.keys(res).length===0 ? false : res[0].password === password;;
}

//getStream
export function getstream(){
  const API_POSTS_STREAM = `${ROOT}/api/stream`;
   fetch(API_POSTS_STREAM)
    .then(response => response.json());
}
   

// export function switchLocale (locale) {
//   return { type: constants.LOCALE_SWITCHED, payload: locale };
// }

/*old login*/

// export function dologin(user,res,redirect){

//   if(validLogin(user,res)){
//     //success login
//     const {login, upvotelist, downvotelist, password} = res[0];
//     console.log(upvotelist);
//     const token = Math.random().toString(36).substring(7);
//     storage.put('token',token);
//     storage.put('user',login);
//     storage.put('pass', password);

//     redirect();

//     return {
//       type: LOGGED_IN,
//       payload: token,
//       user: login,
//       pass: password,
//       upvotelist: upvotelist,
//       downvotelist: downvotelist
//     }; 
//   }else{
//     //failed login
//     alert('bad login info');  
//     return {
//       type: FAILED_LOGIN
//     };
//   }
// }

// export function addPost(pid,title,url){
//   return {
//     type: CREATE_POST,
//     pid: pid,
//     title: title,
//     url: url,
//     time: Date.now(),
//     downvotes: 0,
//     upvotes: 0,
//     comments: 0,
//     pid: null
//   };
// }





