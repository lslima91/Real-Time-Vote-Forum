import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './../actions';
import Loader from 'halogen/ClipLoader';
import Post from './Post';

class Posts extends Component {

  constructor (props, context) {
    super(props, context);
    console.log('props do posts');
    console.log(this.props);

    this.state = {
      filter: 'All'
    };
  }

  /*order posts by upvotes*/
  compare(a,b) {
    if (a.upvotes > b.upvotes)
      return -1;
    if (a.upvotes < b.upvotes)
      return 1;
    return 0;
  }

  handleSelect(){
    this.setState({filter : this.refs.select.value});
  }

  handleComments(pid){
    //dispatch comments rquest
      const { history, dispatch} = this.props;
        dispatch(actions.reqComments(pid,() => {
        this.props.history.pushState(null, `/comments/${pid}`);}
      ));
  }

  render () {
    const {newposts, isFetching} = this.props;
    console.log('POST LISTTTTTTTTTTTTTTTTTTTTTTT');
    console.log(newposts);
    var label = this.state.filter;
    
    let newTest = Object.assign([], newposts);
    newTest.sort(this.compare);
    console.log('newTESTE!!!');
    console.log(newTest);

    /*filter Posts based on labels*/
    let filteredPosts = newTest.filter(function(P) {
      return P.label === label;
    });

    var myPosts = this.state.filter === "All" ? newTest : filteredPosts;

    
    if(isFetching===true){

      return(
        <div className="container posts">
          <div className="row">
            <div className="col-md-1">
            </div>
            <div className="col-md-11">
              <div className="page-header"></div>
              <h1> All Posts</h1> 
              <Loader color="#26A65B" size="64px" margin="4px"/>
            </div>
          </div>
        </div> );
    }else{
      return (
        <div className="container posts">
          <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-10">
            
              <button className="btn btn-default" onClick={this.props.refresh}> refresh </button>

               <div className="row">
                <div className="col-md-4"> 
                  <select onClick={this.handleSelect.bind(this)} ref="select" className="form-control" id="sel1">
                       <option value="All"> All </option>
                       <option value="Pics"> Pics </option>
                       <option value="News"> News </option>
                       <option value="Games"> Games </option>
                       <option value="Videos"> Videos </option>
                     </select>
                </div>
              </div>
             
              <div className="page-header">                
                <h1> Posts </h1>
              </div>

              <ul>
                {myPosts.map((post, i) =>
                  <Post handleComments={this.handleComments.bind(this)} key={i} {...post}/>
              )}
              </ul>

            </div>
          </div>

        </div> 

      );
    }  
  }
}

Posts.propTypes = {
  history: PropTypes.object.isRequired,
  newposts : PropTypes.any,
  refresh: PropTypes.func.isRequired,
  dispatch: PropTypes.any,
  isFetching: PropTypes.boolean
  // isLogged: PropTypes.func.isRequired
};

export default connect()(Posts);