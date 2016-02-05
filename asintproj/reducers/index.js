import { combineReducers } from 'redux';
import { routerStateReducer as router } from 'redux-router';
import {
  REQUEST_POSTS, RECEIVE_POSTS, LOGGED_IN, LOCALE_SWITCHED, LOG_OUT, UPVOTE_POST, DOWNVOTE_POST, FAILED_LOGIN,
  UNDO_UPVOTE_POST, UNDO_DOWNVOTE_POST, CREATE_POST, GET_STREAM_CREATE, GET_STREAM_VOTES, GET_STREAM_COMMENTS, REQUEST_COMMENTS, RECEIVE_COMMENTS
} from './../constants';
import * as storage from './../persistence/storage';

//Posts state
function postsReducer(state = {
  isFetching: false,
  lastUpdated: null,
  normal: {}
}, action) {
  switch (action.type) {

  case REQUEST_POSTS:
    return Object.assign({}, state, {
      isFetching: true,
    });

  case RECEIVE_POSTS:
    return Object.assign({}, state, {
      isFetching: false,
      normal: Object.assign({},action.posts),
      lastUpdated: action.receivedAt,
    });

  case UPVOTE_POST:
    var my_item = Object.assign({},state.normal[action.pid]);
    my_item.upvotes = my_item.upvotes+1;
    return Object.assign({}, state ,{normal: Object.assign({}, state.normal, {[action.pid]: my_item})});

  case UNDO_UPVOTE_POST:
    var my_item = Object.assign({},state.normal[action.pid]);
    my_item.upvotes = my_item.upvotes-1;
    return Object.assign({}, state,{normal: Object.assign({}, state.normal, {[action.pid]: my_item})});

  case DOWNVOTE_POST:
    var my_item = Object.assign({},state.normal[action.pid]);
    my_item.downvotes = my_item.downvotes+1;
    return Object.assign({}, state, {normal: Object.assign({}, state.normal, {[action.pid]: my_item})});

  case UNDO_DOWNVOTE_POST:
    var my_item = Object.assign({},state.normal[action.pid]);
    my_item.downvotes = my_item.downvotes-1;
    return Object.assign({}, state,{normal: Object.assign({}, state.normal, {[action.pid]: my_item})});

  /*stream*/
  case GET_STREAM_VOTES:
    var new_cm = Object.assign({},state.normal);
    new_cm[action.payload.pid] = action.payload;
    return Object.assign({}, state, {normal: new_cm});

  case GET_STREAM_CREATE: 
    return Object.assign({}, state,
      {normal: Object.assign({},state.normal, {[action.payload.pid]: action.payload}
      )});

  default:
    return state;
  }
}

//Login state
function loginReducer(state = {
  token: storage.get('token'),
  locale: storage.get('locale') || 'en',
  user: storage.get('user'),
  pass: storage.get('pass')
}, action){
  switch (action.type) {
    case LOGGED_IN:
      return Object.assign({}, state, {
        token: action.token,
        user: action.user,
      });
    case LOG_OUT:
      return Object.assign({}, state,{
        token : null,
        user : null,
    });
    case LOCALE_SWITCHED:
      return Object.assign({}, state,{
        locale: action.payload
    });
    case FAILED_LOGIN:
     return Object.assign({}, state, {
        token: null,
        user: null
    });
    default:
      return state;
  }
}

//votes state
function votesReducer(state = {
  uplist: {},
  downlist: {},
}, action){
  switch (action.type){
    case LOGGED_IN:
        console.log('Entrei upa!'); 
      return Object.assign({}, state, {
        uplist: Object.assign({},action.upvotelist),
        downlist: Object.assign({},action.downvotelist)
      });

    case UPVOTE_POST:
      return Object.assign({}, state, {
        uplist: Object.assign({},state.uplist,{[action.pid]: 1})
        });

     case UNDO_UPVOTE_POST:
      return Object.assign({}, state, {
        uplist: Object.assign({},state.uplist,{[action.pid]: 0})
        });

    case DOWNVOTE_POST:
      return Object.assign({}, state, {
        downlist: Object.assign({},state.downlist,{[action.pid]: 1})
        });

    case UNDO_DOWNVOTE_POST:
      return Object.assign({}, state, {
        downlist: Object.assign({},state.downlist,{[action.pid]: 0})
        });

    case GET_STREAM_CREATE:   
      return Object.assign({}, state, {
        uplist: Object.assign({},state.uplist,{[action.payload.pid]: 0}),
        downlist: Object.assign({},state.downlist,{[action.payload.pid]: 0}),
      });
    /*******************/

  default :
    return state;
  }
}

//commentsReducer
function commentsReducer(state = {
  isFetchingComments: null,
  lastUpdated: null,
  comments: {}
},action) {
  switch(action.type){

    case REQUEST_COMMENTS:
      return Object.assign({}, state, {
        isFetchingComments: true,
      });

    case RECEIVE_COMMENTS:
      var new_cm = {comments: Object.assign({}, state.comments, {[action.pid]: action.comments})};
      return Object.assign({},state,{isFetchingComments: false}, new_cm);

    case GET_STREAM_COMMENTS:
      var aux_state = Object.assign({},state.comments);
      aux_state[action.pid].unshift(action.comment);
      var new_cm = {comments: Object.assign({}, state.comments, aux_state)};
      return Object.assign({},state,{isFetchingComments: false}, new_cm); 

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  postsReducer,
  loginReducer,
  votesReducer,
  commentsReducer,
  router
});

export default rootReducer;
