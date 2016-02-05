import React from 'react';
import message from './message';

export default class Account extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			text: 'Logged in!'
		};
	}

	componentDidMount() {
		this.timer = setInterval(()=> this.setState({ text: '' }),1000);
		}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	render() {
		return (
			<div>
				{this.state.text}
			</div>
		);
	}
}
