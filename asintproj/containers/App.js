import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Posts from './../components/Posts';
import Header from './../components/Header';
import Footer from './../components/Footer';
import {fetchPosts, logout, getstreamVotes,getstreamCreate, createuser,login, checkUser, receiveComments, getstreamComments} from '../actions';
import * as actions from '../actions';
import * as storage from './../persistence/storage';
import app from './../style/app.css';
import animatedheader from './../scripts/animatedheader';
import scroll from './../scripts/scroll';


var socket = io.connect('http://asintapi.lslima.me');

class App extends Component {
  constructor(props,context) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.isLogged = this.isLogged.bind(this);
    this.handleCreatePost = this.handleCreatePost.bind(this);
    console.log('context ->');
    console.log(context);
    console.log('props -> ');
    console.log(this.props);
  }

  handleLogin() {
    const { history, location } = this.props;
    const { store } = this.context;

    if(this.isLogged()) {
      store.dispatch(logout());
      history.pushState(null, '/logout');
    }else if(location.pathname==='/login'){
      history.pushState(null, '/register');
    }else{
      history.pushState(null, '/login');
    }

  }

  handleRegister(){
    const { history } = this.props;
    const { store } = this.context;
    history.pushState(null, '/register');
  }

  refreshPage(){
    const { store } = this.context;
    store.dispatch(fetchPosts());

    if(this.isLogged()){
      /*login de novo para receber votelists*/
      const login = storage.get('user');
      const password = storage.get('pass');
      store.dispatch(actions.login({login, password},() => {
        history.pushState({}, '/account');})
      );
    }
  }

  componentWillMount(){
    /*Refresh Page*/
    console.log('imprimindo props ->');
    /*gets posts*/
    this.refreshPage();
  }

  componentDidMount() {
    const { store } = this.context;
    socket.on('poststream',(data)=>{
      console.log(data);
      const post = data['new_val'];
        if(post.pid >= Object.keys(this.props.newposts).length){
          console.log('created');
          store.dispatch(getstreamCreate(post));
        }else{
          store.dispatch(getstreamVotes(post)) ;
        }
    });

    socket.on('commentstream', (data)=> {
      const comment = data['new_val'];
      const pid = comment.pid;
      console.log('app pid -> ');
      console.log(pid);
      store.dispatch(getstreamComments(comment,pid));
    });
  }

  isLogged(){
    return this.props.token === null ? false : true;
  }

  handleCreatePost(){
    const { history } = this.props;
    history.pushState({}, '/create');
  }


  render() {
    console.log(this.props.history);
    const { children, inputValue,newposts} = this.props;

    console.log('APPP POSTTTTSSSSS');
    console.log(newposts);
    // const label = this.isLogged() == true? 'logout' : 'login';
    /*hide button when inputing login info*/
    // const toggle = location.pathname=='/login' ? 'none' : '';

    let toggle = ''; let label = 'Login';

    if(location.pathname==='/login'){
      label = 'Register'; toggle = '';
    }else if (location.pathname==='/account') {
      label = 'Logout'; toggle = '';
    }else if (location.pathname==='/register'){
      label = ''; toggle = 'none';
    }else if(this.isLogged()){
      label ='Logout'; toggle = '';
    }

    var style = {
      display: toggle
    };

    var stylecreate = {
      display: this.isLogged() ? '' : 'none'
    };

    return (
      <div>
        <Header history={this.props.history} stylelogin={style} onLogin={this.handleLogin} label={label} stylecreate={stylecreate} onCreate={this.handleCreatePost} />
        {children}
        <Posts history={this.props.history} refresh={this.refreshPage.bind(this)} newposts={newposts} isLogged={this.isLogged} isFetching={this.props.isFetching}/>
        <Footer/>
      </div>
    );  
        // <button style={style} onClick={this.handleLogin}> {label} </button>
        // <button style={stylecreate} onClick={this.handleCreatePost}> Create Post </button>
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.string,
  inputValue: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // Injected by React Router
  children: PropTypes.node,   //children to render subroutes
  //mine
  newposts: PropTypes.object,
  isFetching: PropTypes.boolean,
  token: PropTypes.string
};

App.contextTypes = {
  store: PropTypes.any,
};

function mapStateToProps(state) {
  console.log('mapstatetoprops');
  console.log(state);
  return {
    errorMessage: state.errorMessage,
    inputValue: state.router.location.pathname.substring(1),
    newposts: state.postsReducer.normal,
    isFetching: state.postsReducer.isFetching,
    token: state.loginReducer.token
  };
}

//mapDispatchToProps

export default connect(mapStateToProps, {
})(App);

