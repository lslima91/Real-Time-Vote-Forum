import React, { PropTypes } from 'react';
import * as actions from './../actions';
import { connect } from 'react-redux';
import t from 'tcomb-form';
import storage from './../persistence/storage';
import schemas from './forms/schemas';

var Form = t.form.Form;
var Person = t.struct({
  login: t.String,
  password: t.String
});

class Login extends React.Component {

  constructor(props) {
    super(props);
    console.log('props of login');
    console.log(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(evt) {
    evt.preventDefault();
    var value = this.refs.form.getValue();
    //form validation
    if (!value) {
      alert('Invalid Login!');
    }else{
      const { history, dispatch} = this.props;
      dispatch(actions.login(value,() => {
        history.pushState({}, '/account');})
      );
    }
  }

  render() {
    return (
      <div className="login-section col-md-2">
        <form>
          <Form
            ref="form"
            type={Person}
            options={schemas.LoginOptions}
          />
           <button className="btn btn-default" onClick={this.handleSubmit} type="submit" >Enter</button>
          </form>
        </div>
    );
  }
}

Login.propTypes = {
  /*injected by connect*/
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default connect()(Login);
