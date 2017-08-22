/*global chrome*/

import { h, Component } from 'preact';
const Mousetrap = require('mousetrap');
import TreeView from 'react-treeview';
import uniqueid from 'lodash.uniqueid';
import {formatBytes} from '../lib';

import FilePreview from "./file-preview";
import ImagePreview from "./image-preview";
import FilePreviewTitle from "./file-preview-title";
import Label from "./label";
import Bubble from "./bubble";
import {findingChild, convertFile} from "../methods";
import { css } from 'glamor';

const fileListRepo = `https://api.github.com/repos/%%author%%/%%reponame%%/git/trees/%sha%`;
const branchesUrl = `https://api.github.com/repos/%%author%%/%%reponame%%/branches`;
const fileUrl = `https://api.github.com/repos/%%author%%/%%reponame%%/contents`;

const arrowIcon = chrome.extension.getURL("assets/images/arrow.svg");
const arrowIconHover = chrome.extension.getURL("assets/images/arrow_hover.svg");
const INIT_STATE = {
	showNavtreeOverlay: false,
	tree: [],
	branches: [],
	branch: "",
	author: "",
	reponame: "",
	code: "",
	filePreview: null,
	fileHtmlUrl: "",
	fileDownloadUrl: "",
	fileSize: "",
	fileTitle: null,
	type: null,
	loading: false,
	loadingTree: false,
	authToken: null,
	fileLines: 0
};

const errors = {
	"403": "Message from Github API: The requests exceeded from your IP. " +
		"Our recommendation, is to setup your Personal access token making " +
		"that you can configure in your Github settings (https://github.com/settings/tokens) " +
		"explained here: https://github.com/dimaslz/navtree#allow-private-repos and after, paste " +
		"this token making click on our extension icon, and refresh.",
	"401": "Your token is not valid. Try to setup a new one."
};

export default class Github extends Component {

	constructor() {
		super();
		this.state = INIT_STATE;

		this._showNavtreeOverlay = this._showNavtreeOverlay.bind(this);
		this._handleClick = this._handleClick.bind(this);
		this._child = this._child.bind(this);
		this._getBranches = this._getBranches.bind(this);
		this._getFile = this._getFile.bind(this);
		this._getCurrentBranch = this._getCurrentBranch.bind(this);
		this._checkAuthozation = this._checkAuthozation.bind(this);
		this._getFileLines = this._getFileLines.bind(this);
		this._doSwitchBranch = this._doSwitchBranch.bind(this);
		this._getTree = this._getTree.bind(this);
		this._contains = this._contains.bind(this);
		this._openFile = this._openFile.bind(this);

		this.path = '';
	}

	componentDidMount() {
		const author = document.querySelector(".repohead .repohead-details-container h1 [itemprop=author]").innerText;
		const reponame = document.querySelector(".repohead .repohead-details-container h1 [itemprop=name]").innerText;
		this.setState({
			author,
			reponame
		});

		const self = this;

		this._checkAuthozation();

		Mousetrap.bind(['command+e', 'ctrl+e'], () => {
			self._showNavtreeOverlay();
		});
	}

	componentWillUnmount() {
		document.body.style.overflow = "";
		this.setState(INIT_STATE);
	}

	_openFile(filename) {
		let path = filename.split('/');
		path.shift();
		const isFolder = path.length > 1;
		console.log("path", path);
		const self = this;
		const interval = setInterval(() => {
			if (document.querySelector(".info,.node")) {
				clearInterval(interval);

				const clickOnText = (text) => {
					console.log("BB", isFolder , path.length, text)
					if (isFolder && path.length === 0 && self.state.filePreview) {
						return;
					}
					self._contains(".info,.node", text)[0].click();
					setTimeout(() => {
						if (path) {
							const click = path.shift();
							if (click) {
								return clickOnText(click);
							}
						}
					}, 500);
				};

				let text = path.shift();
				clickOnText(text);
			}
		}, 500);
	}

	_contains(selector, text) {
		const elements = document.querySelectorAll(selector);
		return Array.prototype.filter.call(elements, (element) => {
			return RegExp(text).test(element.textContent);
		});
	}

	_checkAuthozation() {
		const self = this;
		let authToken = null;

		chrome.storage.sync.get({
			token: false
		}, (items) => {

			if (items.token) {
				authToken = items.token;
				self.setState({
					authToken
				});
			} else {
				console.warn("Please, setup a 'Personal access token'(https://github.com/settings/tokens) to allow unlimited request to Github API");
			}

			this._getBranches(authToken);
		});
	}

	_getCurrentBranch() {
		// const elm = document.querySelector(".branch-select-menu span");
		const elm = document.querySelector(".branch-select-menu button.select-menu-button span");
		return elm ? elm.innerText : null;
	}

	_getFile(node) {
		const { authToken, branch, author, reponame } = this.state;

		const type = /gif|png|jpg|jpeg/i.test(node.path) ? "image" : "file";

		localStorage.setItem("navtree.lastFileSeen", node.filename);

		this.setState({
			filePreview: null,
			loading: true,
			type
		});
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			`${fileUrl.replace('%%author%%', author).replace('%%reponame%%', reponame)}${node.filename}?ref=${branch.name}`,
			{ headers }
		);

		fetch(request)
			.then((response) => {
				if (response.status === 403) {
					throw errors["403"];
				}
				if (response.status === 401) {
					throw errors["401"];
				}

				return response.json();
			})
			.then((file) => {
				this.setState({
					fileTitle: node.path,
					filePreview: type === "file" ? convertFile(node, file) : file.content,
					fileSize: file.size,
					fileSha: node.sha,
					fileHtmlUrl: file.html_url,
					fileDownloadUrl: file.download_url,
					loading: false
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	_getBranches(authToken) {
		const { author, reponame } = this.state;

		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const currentBranch = document.querySelector(".branch-select-menu button.select-menu-button span").innerText;


		const request = new Request(
			branchesUrl.replace('%%author%%', author).replace('%%reponame%%', reponame),
			{ headers }
		);

		fetch(request)
			.then((response) => {
				if (response.status === 403) {
					throw errors["403"];
				}
				if (response.status === 401) {
					throw errors["401"];
				}

				return response.json();
			})
			.then((branches) => {
				this.setState({
					branches,
					branch: branches.find(b => b.name === currentBranch) || branches[0]
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	_doSwitchBranch(e) {
		const branch = this.state.branches.filter(b => b.name === e.target.value)[0];
		this.setState({ branch });
		this._getTree();
	}

	_showNavtreeOverlay() {
		this.setState({ showNavtreeOverlay: !this.state.showNavtreeOverlay });

		if (this.state.showNavtreeOverlay) {
			document.body.style.overflow = "hidden";
			this._getTree();
			const lastFileSeen = localStorage.getItem("navtree.lastFileSeen");
			console.log("items", lastFileSeen)
			if (lastFileSeen) {
				this._openFile(lastFileSeen);
			}

		} else {
			document.body.style.overflow = "";
		}
	}

	_getTree() {
		const { authToken, branch, author, reponame } = this.state;
		const self = this;

		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			fileListRepo.replace('%%author%%', author).replace('%%reponame%%', reponame).replace("%sha%", branch.commit.sha),
			{ headers }
		);

		this.setState({
			loadingTree: true
		});

		fetch(request)
			.then((response) => {
				if (response.status === 403) {
					throw errors.limitRequests;
				}
				if (response.status === 401) {
					throw errors["401"];
				}

				return response.json();
			})
			.then(({tree}) => {
				tree = tree.map(t => {
					t["id"] = uniqueid();
					return t;
				});
				this.setState({
					tree,
					loadingTree: false
				});
				Mousetrap.bind("esc", () => {
					if (self.state.showNavtreeOverlay) {
						self.setState({ showNavtreeOverlay: !self.state.showNavtreeOverlay });
						document.body.style.overflow = "";
					}
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	_handleClick(node) {
		const { authToken, author, reponame } = this.state;
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			fileListRepo.replace('%%author%%', author).replace('%%reponame%%', reponame).replace("%sha%", node.sha),
			{ headers }
		);

		fetch(request)
			.then((response) => {
				if (response.status === 403) {
					throw errors.limitRequests;
				}
				if (response.status === 401) {
					throw errors["401"];
				}

				return response.json();
			})
			.then(({tree}) => {
				tree = tree.map(t => {
					t["id"] = uniqueid();
					return t;
				});
				const newTree = findingChild(this.state.tree, node.id, tree);
				this.setState({ tree: newTree });
			})
			.catch((err) => {
				console.error(err);
			});
	}

	_child(tree, parent) {

		return tree.map((node, i) => {
			node["filename"] = `${parent ? parent["filename"] : ''}/${node.path}`;

			const label = <Label class="node" node={node} onClick={this._handleClick}/>;

			const isAFont = /ttf|eot|svg|woff/ig.test(node.path.split('.').pop());

			return node.type === "tree" ? <TreeView
				key={node.node + '|' + i}
				nodeLabel={label}
				collapsed={!node.compressed}
				onClick={() => this._handleClick(node)}
			>
				{node.child ? this._child(node.child, node) : null}
			</TreeView> : <div
				style={{ cursor: isAFont ? "not-allowed" : "pointer" }}
				class="info"
				onClick={() => {
					return isAFont ? false : this._getFile(node);
				}}>{node.path}</div>;
		});
	}

	_getFileLines(lines) {
		this.setState({ fileLines: lines});
	}

	render(props, state) {
		const {
			showNavtreeOverlay,
			tree,
			loading,
			loadingTree,
			branch,
			branches,
			filePreview,
			fileSize,
			fileHtmlUrl,
			fileDownloadUrl,
			fileSha,
			fileTitle,
			fileLines,
			type
		} = state;

		return (
			<div>
				{showNavtreeOverlay ?
					<div
						id="nt_overlay"
						style={{
							width: "100%",
							minWidth: "1020px",
							minHeight: "100%",
							height: "100%",
							position: "fixed",
							top: "0",
							left: "0",
							zIndex: "50",
							display: "flex",
							flex: "1",
							background: "rgba(248, 248, 248, 0.98)"
						}}
					>
						<div
							style={{
								display: "flex",
								width: "100%",
								height: "100%",
								flexDirection: "row"
							}}
						>

							<div
								id="nt_tree-column"
								style={{
									minWidth: "300px",
									maxWidth: "300px",
									borderRight: "1px solid rgb(204, 204, 204)",
									position: "relative",
									display: "flex",
									flexDirection: "column"
								}}
							>

								<div
									className={css({
										width: "100%",
										backgroundColor: "#24292e"
									})}
								>
									<select
										onChange={this._doSwitchBranch}
										className={css({
											border: "none",
											WebkitAppearance: "none",
											MozAppearance: "none",
											appearance: "none",
											background: `transparent url('${arrowIcon}') no-repeat 90% 50%`,
											padding: "15px 10px",
											width: "100%",
											color: "rgba(255,255,255,0.75)",
											cursor: "pointer",
											lineHeight: "20px",
											height: "50px",
											':hover': {
												background: `transparent url('${arrowIconHover}') no-repeat 90% 50%`
											},
											':focus': {
												outline: "none"
											}
										})}
										id="nt_tree-branch-selector"
									>
										{branches.map(
											(b) => <option selected={b.name === branch.name} value={b.name}>{b.name}</option>
										)}
									</select>
								</div>

								<div
									style={{
										flex: "1",
										overflow: "auto",
										height: "100%",
										padding: "10px",
										position: "relative"
									}}
								>
									{loadingTree ? <div
										style={{
											position: "absolute",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											left: "0",
											top: "0",
											width: "100%",
											height: "100%",
											zIndex: "1",
											background: "rgba(255, 255, 255, 0.7)"
										}}
									>
										loading...
									</div> : null}
									{this._child(tree)}
								</div>

							</div>

							<div
								id="nt_file-preview"
								style={{
									width: "calc(100% - 300px)",
									display: "flex",
									flexDirection: "column",
									flex: 1
								}}
							>
								{fileTitle ? <FilePreviewTitle
									title={fileTitle}
									fileDownloadUrl={fileDownloadUrl}
								/> : null}
								{filePreview ? <div
									style={{
										display: "flex",
										flexDirection: "column",
										padding: "10px"
									}}
								>
									<span>Github url: <a href={fileHtmlUrl} target="_blank">{fileHtmlUrl}</a></span>
									<span>Size: {formatBytes(fileSize)}</span>
									{type === "file" ? <span>{fileLines} lines</span> : null}
								</div> : null}

								{filePreview && type === "image"
									? <ImagePreview filePreview={filePreview}/> : null}
								{filePreview && type === "file"
									? <FilePreview
											filePreview={filePreview}
											fileHtmlUrl={fileHtmlUrl}
											fileSize={fileSize}
											fileSha={fileSha}
											doGetFileLines={this._getFileLines}/> : null}
								{!filePreview ?
									<span
										style={{
											width: "100%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "22px",
											flexDirection: "column",
											height: "100%"
										}}
									>
										{loading ? <h6>Loading...</h6> :
											<span style={{ textAlign: "center" }}>
												<h1>Navtree</h1>
												<h2>Tree navigator for Github</h2>
												<span
													style={{
														marginTop: "50px",
														display: "block",
														fontSize: "14px"
													}}
												>Select any file from left tree view</span>

												<span
													style={{
														display: "block",
														marginTop: "50px",
														fontSize: "12px"
													}}
												>
													Press <code style={{ fontWeight: "600" }}>ESC</code>, <code style={{ fontWeight: "600" }}>CMD+E/CTRL+E</code> or click on <code style={{ fontWeight: "600" }}>Bubble</code> again to close Navtree.
												</span>
											</span>
										}
									</span>
								: null}
							</div>

						</div>

					</div>
				: null}

				<Bubble onClick={this._showNavtreeOverlay} />
			</div>
		);
	}
}