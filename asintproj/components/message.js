import React, { PropTypes } from 'react';

class message extends React.Component {

	constructor(props){

	super(props);
    console.log('account props');
    console.log(props);
		this.handleClick = this.handleClick.bind(this);
	}
  render () {
	  return (
	  <div>  {this.props.text} </div>
	);
  }
}

message.propTypes = {
	text: PropTypes.string.isRequired
};

export default message;
