import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from './../actions';
import t from 'tcomb-form';
import schemas from './forms/schemas';

var Form = t.form.Form;

var label = t.enums.of('News Pics Games Videos');
var CreatePost = t.struct({
  title: t.String,
  url: t.String,
  label: label
});

var CreateOptions = {
  fields: {
    title: {
      attrs: {
        autoFocus: true,
        placeholder: 'login...'
      }
    },
    url: {
      attrs: {
        autoFocus: true,
        placeholder: 'url...'
      }
    },
    label: {
      options: [
        {value: 'News', text: 'News'}, // an option,
        {value: 'Pics', text: 'Pics'},
        {value: 'Games', text: 'Games'},
        {value: 'Videos', text: 'Videos'}
      ]
    }
  }
};


class Createpost extends React.Component {

   constructor(props) {
    super(props);
    console.log('props of Regiser');
    console.log(props);
  }

  handleEnter(evt) {
    console.log('enter create post');
    evt.preventDefault();
    var value = this.refs.form.getValue();
    console.log(value);
    /*validation*/
    if (!value) {
      alert('invalid post info');
    }else{
      console.log('okeyyyy son');
      const { history, dispatch, login } = this.props;
      dispatch(actions.createPost(value,login,() => {
        history.pushState({}, '/');})
      );
    }
  }

  render() {
    return (
      <div className="createpost-section col-md-2">
        <Form
          ref="form"
          type={CreatePost}
          options={CreateOptions}
        />
        <button className="btn btn-default" onClick={this.handleEnter.bind(this)}>Submit</button>
        </div>
    );
  }
}

Createpost.propTypes = {
  //injected from connect
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  //state
  login: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    login: state.loginReducer.user,
  };
}

export default connect(mapStateToProps)(Createpost);