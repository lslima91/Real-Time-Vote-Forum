import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './../actions';
import * as storage from './../persistence/storage';
import Loader from 'halogen/ClipLoader';
import Comment from './Comment';
import Post from './Post';

class Comments extends Component {

  constructor (props) {
    super(props);
    console.log('props comments');
    console.log(props);

    /*load comments*/
    const {pid} = this.props.params;
    const {dispatch} = this.props;
    dispatch(actions.reqComments(pid,()=>null));
  }

  componentWillMount() {
    // /*load comments*/
    // const {pid} = this.props.params;
    // const {dispatch} = this.props;
    // dispatch(actions.reqComments(pid));
  }

  handleReply(evt){
    evt.preventDefault();
    const {dispatch} = this.props;
    const {pid} = this.props.params;
    const user = storage.get('user');
    console.log(this.props);
    console.dir('REPLYYYYYYYYYY');
    console.log(pid);
    console.log(user);
    let comment = this.refs.replybox.value;
    this.refs.replybox.value = '';
    actions.createComment(pid,user,comment);
  }

  refresh(){
    const {pid} = this.props.params;
    const {dispatch} = this.props;
    dispatch(actions.reqComments(pid));
  }


  render(){
    console.log('STATETETE');
    var pid = this.props.params.pid;
    const {comments, isFetching} = this.props;
    const mycomments = comments[pid];
    console.log('comments reducer **************');
    console.log(mycomments);
    console.log(pid);
    console.log(comments);
    console.log(isFetching);
    // || isFetching===null || mycomments==undefined
    if (isFetching===true || mycomments==undefined) {
            return (
              <div classNameName="container">
                <div className="container">
                  
                  <div className="row">
                    <div className="comment-section col-sm-12">
                      <h3>{pid} comments</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-5"></div>
                  </div>
                  <Loader color="#26A65B" size="64px" margin="4px"/> 
                  <button onClick={this.refresh.bind(this)}> refresh comments </button> 
                </div>
              </div>
            );
        }else{
          return (

            <div classNameName="container">
              <div className="container">
                
                <div className="row">
                  <div className="comment-section col-sm-12">
                    <h3>{pid} comments</h3>
                  </div>
                </div>
                <button onClick={this.refresh.bind(this)}> refresh comments </button>
                <div className="row">
                  <div className="col-sm-5">
                  <form role="form">
                    <div className="form-group">
                      <label htmlFor="comment">Comment:</label>
                      <textarea ref='replybox' className="form-control" rows="5" id="comment"></textarea>
                      <button onClick={this.handleReply.bind(this)} type="submit">Reply</button> 
                    </div>

                  </form>
                  </div>
                  </div>

                  <ul>
                     {mycomments.map((comment, i) =>
                       <Comment handleComments={this.handleReply.bind(this)} key={i} {...comment}/>
                   )}
                  </ul>
             
              </div>
            </div> 

            
            );
          
        }

  }
}

Comments.propTypes = {
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  pid: PropTypes.any,
  user: PropTypes.string,
  comments: PropTypes.any,
  isFetching: PropTypes.boolean
};

function mapStateToProps(state){
  return {
    comments: state.commentsReducer.comments,
    isFetching: state.commentsReducer.isFetchingComments
  };
}

export default connect(mapStateToProps)(Comments);