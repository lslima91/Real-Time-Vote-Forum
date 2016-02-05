import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class Header extends Component {

	constructor(props){
		super(props);
	}

	handleHome() {
		this.props.history.pushState(null, '/');
	}

	render() {
		return (
			<div id="top">		
				<nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
					<div className="container-fluid">

					<div className="navbar-header">
						<button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						<a href="#top" className="navbar-brand" onClick={this.handleHome.bind(this)} >ASINT News</a>
					</div>

					<div className="collapse navbar-collapse navbar-ex1-collapse">
						<ul className="nav navbar-nav">

							<li> 
							    <a href="#" style={this.props.stylelogin} onClick={this.props.onLogin}>
							    {this.props.label}
							    </a> 
							</li>

							<li> 
							    <a href="#" style={this.props.stylecreate} onClick={this.props.onCreate}>
							    Create Post
							    </a> 
							</li>

						</ul>
						
						<ul className="nav navbar-nav navbar-right">
							<li> <a href="#top">Top</a> </li>
							<li> <a href="#how">How</a> </li>
							<li> <a href="#tools">Tools</a> </li>
							<li> <a href="#api">API</a> </li>
							<li> <a href="#contact">Contact Me</a> </li>
						</ul>
					</div>
					</div>
				</nav>
			</div>
		);
	}
}

Header.propTypes = {
	onLogin: React.PropTypes.function,
	onCreate: React.PropTypes.function,
	label: React.PropTypes.string,
	history: React.PropTypes.any
};


export default Header;
