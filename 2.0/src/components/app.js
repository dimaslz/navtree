import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Github from "./github";
import Redirect from "./redirect";
import Popup from "./popup";

export default class App extends Component {
	constructor() {
		super();

		this.state = {
			isBubble: false
		};

		this._handleRoute = this._handleRoute.bind(this);
	}

	_handleRoute(e) {
		this.currentUrl = e.url;

		const isBubble = [
			"/index.html",
			"/popup.html"
		].join(',').indexOf(e.url) === -1;

		this.setState({
			isBubble
		});
	}

	render(props, state) {
		const { isBubble } = state;

		return (
			<div
				id="app"
				style={isBubble ? {
					position: "absolute",
					width: "0",
					height: "0"
				} : null}
			>
				<Router onChange={this._handleRoute}>
					<Redirect path="/index.html" to="/popup.html" />
					<Popup path="/popup.html" />
					<Github default />
				</Router>
			</div>
		);
	}
}
