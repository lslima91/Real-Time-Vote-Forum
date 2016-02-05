import React from 'react';

export default class Footer extends React.Component {

	render() {
		return (
			<div className="container-fluid">



				<section className="row content-filler" > 
					<div className="down-button"> 
						<a className="btn" href="#how">
							<i className="fa fa-arrow-circle-down fa-4x"> </i> 
						</a>
					</div>
				</section>

				<section id="how" className="row text-banner"> 
					<h1> Real Time Web Application </h1>
					<h2> Clients can see each other's votes in real-time </h2>
				</section>

		
				<section className="row diagram">
					<img className="img-responsive" src="http://i.imgur.com/s98qw3G.png"/> 

				</section>

				<section className="row content-filler"> 
				</section>

				<section id="tools" className="row text-banner"> 
					<h1> Powered By </h1>
				</section>

				<section className="row tools-section">
					<div className="tools-element col-md-4">
						<img className="img-responsive" src="https://node-os.com/images/nodejs.png"/> 
						<h2> Node Js </h2>
						<p> Backend </p>
					</div>

					<div className="tools-element col-md-4">
						<img className="img-responsive" src="http://i.imgur.com/t97YNK5.png"/>
						<h2> React </h2>
						<p> Performant view library </p>
					</div>

					<div className="tools-element col-md-4">
						<img className="img-responsive" src="http://i.imgur.com/G81ksij.png"/>
						<h2> RethinkDB </h2>
						<p> Database for real time applications </p>
					</div>
				</section>

				<section className="row content-filler"> 

				</section>

				<section id="api" className="row text-banner"> 
					<h1> Public API </h1>
					<h2> Make your own client </h2>
					<h3> Click on the image to consult the swagger documentation </h3>
				</section>

				<section className="row api-section ">
					<a href='http://docs.lslima.me'>
					<img className="img-responsive" src="https://avatars2.githubusercontent.com/u/7658037?v=3&s=400"/>
					</a>
				</section>

				<section className="row content-filler"> 

				</section>

				<section id="contact" className="row contact-me"> 
					<h1> Contact Me </h1>
					<h2> <i className="fa fa-github fa-2x"></i> </h2>
				</section>

				<footer className="row"> 
					<h1>  </h1>
				</footer>
			</div>
		);
	}
}
