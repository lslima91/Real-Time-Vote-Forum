import React, { PropTypes, Component } from 'react';

class Comment extends Component {

	constructor(props, context){
		super(props);
	}

	render() {
		const {comment, author, time} = this.props;
		const sub = time.split('T');

		console.log('comment ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		console.log(this.props.comment);
		return (
			<div>
				  <div className="row">
				    <div className="col-sm-5">
					    <div className="panel panel-default">
					    	<strong>{author} </strong> 
					    	<span className="text-muted">submited {sub[0]}</span>
						    <div className="panel-body">{comment}</div>
					    </div>
				    </div>
				  </div>
			</div>
		);
	}
}



Comment.propTypes = {
	comment: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired,
	time: PropTypes.string
};

export default Comment;