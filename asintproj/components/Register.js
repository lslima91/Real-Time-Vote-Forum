import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from './../actions';
import t from 'tcomb-form';
import schemas from './forms/schemas';

var Form = t.form.Form;

/*email validation*/
var email = t.refinement(t.String, function (email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
});

var Registration = t.struct({
  email: email,
  login: t.String,
  password: t.String
});

class Register extends React.Component {

   constructor(props) {
    super(props);
    console.log('props of Regiser');
    console.log(props);
  }

  handleEnter(evt) {
    evt.preventDefault();
    var value = this.refs.form.getValue();
    /*validation*/
    if (!value) {
      alert('invalid registration info');
    }else{
      const { history, dispatch, login } = this.props;
      actions.createUser(value,() => {
        history.pushState({}, '/');});
    }
  }

  render() {
    return (
      <div className="register-section col-md-2">
        <Form
          ref="form"
          type={Registration}
          options={schemas.RegisterOptions}
        />
        <button onClick={this.handleEnter.bind(this)}>Submit</button>
        </div>
    );
  }
}

Register.propTypes = {
  //injected from connect
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  //state
  login: PropTypes.string
};

export default connect()(Register);