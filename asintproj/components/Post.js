import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import {upvotePosts, downvotePosts, undoupvotePosts, undodownvotePosts} from '../actions';


class Post extends React.Component {

  constructor(props){
    super(props);
   	this.handleUpvote = this.handleUpvote.bind(this);
    this.handleDownvote = this.handleDownvote.bind(this);
    this.requireAuth = this.requireAuth.bind(this);
    this.getComments = this.getComments.bind(this);
  }

  requireAuth(){
    const {token} = this.props;
    return token!==null;
  }

  handleUpvote(){
    if(this.requireAuth()){
      const {pid, dispatch, user, uplist} = this.props;
      uplist[pid] === 0 ? dispatch(upvotePosts(pid,user)) : dispatch(undoupvotePosts(pid,user));
    }else{
      alert('login please!');
    } 
  }

  handleDownvote(){
    if(this.requireAuth()){
      const {pid, dispatch, user, downlist} = this.props;
      downlist[pid] === 0 ? dispatch(downvotePosts(pid,user)) : dispatch(undodownvotePosts(pid,user));
    }else{
      alert('login please!');
    }
  }

  getComments(){
    const {pid} = this.props;
    console.log(this.props);
    this.props.handleComments(pid);
  }

	render() {
		const style = {
	    color: '#808080',
	    background:'none',
	    border:'none',
	    boxshadow:'none'
	  };
    const {i, title, upvotes, downvotes, comments, submited, pid, uplist, downlist, url, label} = this.props;
    const sub = submited.split('T');
    // const sub = []; sub.concat('time');
    
    let upcolor, downcolor;
    if(this.requireAuth()){
      /*upvotes*/
      upcolor = uplist[pid]===1 ? 'green' : '#808080';
      /*downvotes*/
      downcolor = downlist[pid]===1 ? 'green' : '#808080';
    }else {
      upcolor = '#808080'; downcolor = '#808080';
    }
    const upstyle = {
      color: upcolor
      };
    const downstyle = {
      color: downcolor
      };
    
		return (
			 <div className="row">
              <div className="col-md-2">
                <img alt="Bootstrap Image Preview" src="http://lorempixel.com/100/100/technics/" className="img-rounded"/>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">                    
                      <li key={i}> <h4>{title}</h4> </li>                       
                    <p>
                      <span className="label label-default">{label}</span> 
                      <a className="btn" href="#">{url}</a>
                    </p>
                    <p style={{color: '#808080'}} >
                      <button onClick={this.handleUpvote} style={style} type="button" className="btn btn-primary btn-xs">
                        <span style={upstyle} className="fa fa-lg fa-chevron-up" aria-hidden="true"> {upvotes} </span>
                      </button>
                      <button onClick={this.handleDownvote} style={style} type="button" className="btn btn-default btn-xs">
                        <span style={downstyle} className="fa fa-lg fa-chevron-down" aria-hidden="true"> {downvotes} </span>
                      </button>
                      &nbsp;&nbsp;&nbsp;
                      <button style={style} type="button" className="btn btn-default btn-xs">
                        <span onClick={this.getComments} className="fa fa-lg fa-comments" aria-hidden="true"> {comments} </span>
                      </button>
                      &nbsp;&nbsp;&nbsp;
                      submited {sub[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
		);
	}
}

Post.propTypes = {
  /*injected by connect*/
  dispatch: PropTypes.func.isRequired,
  /*posts props*/
  handleComments: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	upvotes: PropTypes.number,
	downvotes: PropTypes.number,
	comments: PropTypes.number,
	i: PropTypes.number,
	pid: PropTypes.number.isRequired,
	submited: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  /*state*/
	token: PropTypes.string,
  user: PropTypes.string,
  uplist: PropTypes.object,
  downlist: PropTypes.object
};

function mapStateToProps(state) {
  return {
    token: state.loginReducer.token,
    user: state.loginReducer.user,
    uplist: state.votesReducer.uplist,
    downlist: state.votesReducer.downlist
  };
}

export default connect(mapStateToProps)(Post);
