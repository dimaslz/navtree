/*global chrome: object*/

import { h, Component } from 'preact';

import NavtreeLogo from '../assets/bubble.png';

export default class Popup extends Component {
	constructor() {
		super();

		this.state = {
			enable: false,
			token: ""
		};

		this._saveToken = this._saveToken.bind(this);
		this._popupIsAvailable = this._popupIsAvailable.bind(this);
	}

	componentDidMount() {
		this._popupIsAvailable();
	}

	_popupIsAvailable() {
		const self = this;
		chrome.storage.sync.get({
			token: false
		}, (items) => {
			if (items.token) {
				self.setState({
					token: items.token,
					offuscated: true
				});
			}
		});
		chrome.tabs.getSelected(null, (tab) => {

			if (/https:\/\/*github.com\/.*?\/.*/ig.test(tab.url)) {
				this.setState({
					enable: true
				});
			} else {
				this.setState({
					enable: false
				});
			}
		});
	}

	_saveToken() {
		chrome.storage.sync.set({
			token: this.inputToken.value
		});
	}

	render(props, state) {
		const { enable, token } = state;

		return (
      <div
				style={{
					width: "300px",
					height: "200px",
					display: "flex",
					padding: "10px",
					fontFamily: "Open Sans"
				}}
			>

				{enable ?
					<span>
						<h1
							style={{
								fontSize: "18px",
								fontWeight: "400",
								margin: "0 0 10px 0"
							}}
						>
							Navtree settings
						</h1>

						<span
							style={{
								fontSize: "12px",
								display: "block"
							}}
						>
							To use Navtree on private repos or avoid the request limits from Github API,
							is necessary setup a token.
						</span>
						<span
							style={{
								display: "flex",
								width: "100%",
								marginTop: "10px"
							}}
						>
							<input
								style={{
									padding: "5px",
									fontSize: "12px",
									flex: "1",
									marginRight: "5px"
								}}
								value={token}
								ref={input => this.inputToken = input}
								type="password"
								placeholder="type here your github token"
							/>
							<button
								type="button"
								style={{
									background: "#efefef",
									border: "0px"
								}}
								onClick={this._saveToken}
							>
								Save
							</button>
						</span>

						<span
								style={{
									fontSize: "11px",
									marginTop: "10px",
									display: "block"
								}}
						>
							To generate a Personal access token click <a href="https://github.com/dimaslz/navtree#allow-private-repos" target="_blank">here</a>
						</span>

						<footer
							style={{
								width: "100%",
								textAlign: "right",
								position: "absolute",
								bottom: "5px",
								right: "5px"
							}}
						>
							Build by <a href="https://twitter.com/dimaslz" target="_blank">@dimaslz</a>
							<a href="https://paypal.me/dimaslz" target="_blank" style={{ marginLeft: "5px" }}>Buy me a beer or coffee</a>
						</footer>
					</span>
				:
					<span
						style={{
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center"
						}}
					>
						<img
							src={NavtreeLogo}
							style={{
								width: "50px",
								height: "50px"
							}}
						/>
						<h1
							style={{
								fontSize: "36px",
								fontWeight: "400",
								margin: "0px"
							}}
						>Navtree</h1>
						<span
							style={{
								fontSize: "14px",
								fontWeight: "300",
								textAlign: "center"
							}}
						>
							This extension is not available for this site
						</span>
						<span
							style={{
								fontSize: "13px",
								fontWeight: "300",
								textAlign: "center",
								marginTop: "20px"
							}}
						>
							Navtree only is use for navigate on Github repositories
						</span>

						<footer
							style={{
								width: "100%",
								textAlign: "right"
							}}
						>
							Build by <a href="https://twitter.com/dimaslz" target="_blank">@dimaslz</a>
							<a href="https://paypal.me/dimaslz" target="_blank" style={{ marginLeft: "5px" }}>Buy me a beer or coffee</a>
						</footer>
					</span>
				}
			</div>
		);
	}
}