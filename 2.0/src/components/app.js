import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Options from "./options";
import Github from "./github";
import Redirect from "./redirect";
import Popup from "./popup";

export default class App extends Component {
	constructor() {
		super();

		this._handleRoute = this._handleRoute.bind(this);
	}

	_handleRoute(e) {
		// console.log("e", e);
		this.currentUrl = e.url;
	}

	render(props, state) {

		return (
			<div id="app">
				<Router onChange={this._handleRoute}>
					<Redirect path="/index.html" to="/options" />
					<Options path="/options" />
					<Popup path="/popup.html" />
					<Github default />
				</Router>
			</div>
		);
	}
}
