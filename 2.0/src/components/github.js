/*global chrome*/

import { h, Component } from 'preact';
const Mousetrap = require('mousetrap');
import TreeView from 'react-treeview';
import uniqueid from 'lodash.uniqueid';
import {formatBytes} from '../lib';

import FilePreview from "./file-preview";
import ImagePreview from "./image-preview";
import FilePreviewTitle from "./file-preview-title";
import {Label} from "./label";
import Bubble from "./bubble";
import {findingChild, convertFile} from "../methods";
import { css } from 'glamor';

const author = "dimaslz";
const repo = "navtree";
const master = "master";
const fileListRepo = `https://api.github.com/repos/${author}/${repo}/git/trees/%sha%`;
const branchesUrl = `https://api.github.com/repos/${author}/${repo}/branches`;
const downloadUrl = `https://raw.githubusercontent.com/${author}/${repo}/${master}/`;
const fileUrl = `https://api.github.com/repos/${author}/${repo}/contents`;

const arrowIcon = chrome.extension.getURL("assets/images/arrow.svg");
const arrowIconHover = chrome.extension.getURL("assets/images/arrow_hover.svg");

function getCurrentSha() {
	const elm = document.querySelector(".commit-tease-sha");
	return elm ? elm.href.split("/").pop() : null;
}
export default class Github extends Component {

	constructor() {
		super();
		this.state = {
			showNavtreeOverlay: false,
			tree: [],
			branches: [],
			branch: "",
			code: "",
			filePreview: null,
			fileHtmlUrl: "",
			fileDownloadUrl: "",
			fileSize: "",
			fileTitle: null,
			type: null,
			loading: false,
			authToken: null,
			fileLines: 0,

			currentBranch: null,
			currentSha: null
		};

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

		this.path = '';
	}

	componentDidMount() {
		this._checkAuthozation();

		// const tabCodeSelector = document.querySelector(".reponav-item.selected");
		// const isInCode = tabCodeSelector ? tabCodeSelector.innerText.trim().toLowerCase() === "code" : null;

		// if (/https:\/\/*github.com\/.*?\/.*/gi.test(document.location.href) && isInCode) {
		// 	chrome.browserAction.setIcon({ path: "assets/images/icon16.png" });
		// } else {
		// 	chrome.browserAction.setIcon({ path: "assets/images/icon16_off.png" });
		// }

		const self = this;
		Mousetrap.bind(['command+e', 'ctrl+e'], () => {
			self._showNavtreeOverlay();
		});
	}

	componentWillUnmount() {
		document.body.style.overflow = "";
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
			this.setState({
				currentBranch: this._getCurrentBranch(),
				currentSha: getCurrentSha()
			});
		});
	}

	_getCurrentBranch() {
		const elm = document.querySelector(".branch-select-menu span");
		return elm ? elm.innerText : null;
	}

	_getFile(node) {
		const { authToken, branch } = this.state;

		const type = /gif|png|jpg|jpeg/i.test(node.path) ? "image" : "file";

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
			`${fileUrl}${node.filename}?ref=${branch.name}`,
			{ headers }
		);

		fetch(request)
			.then((response) => response.json())
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
			});
	}

	_getBranches(authToken) {

		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			branchesUrl,
			{ headers }
		);

		fetch(request)
			.then((response) => response.json())
			.then((branches) => {
				this.setState({
					branches,
					branch: branches[0]
				});
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
		} else {
			document.body.style.overflow = "";
		}

		this._getTree();
	}

	_getTree() {
		const { authToken, branch } = this.state;
		const self = this;

		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			fileListRepo.replace("%sha%", branch.commit.sha),
			{ headers }
		);

		fetch(request)
			.then((response) => response.json())
			.then(({tree}) => {
				tree = tree.map(t => {
					t["id"] = uniqueid();
					return t;
				});
				this.setState({ tree });
				Mousetrap.bind("esc", () => {
					self.setState({ showNavtreeOverlay: !self.state.showNavtreeOverlay });
					document.body.style.overflow = "";
				});
			});
	}

	_handleClick(node) {
		const { authToken } = this.state;
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		if (authToken) {
			headers.set('Authorization', `token ${authToken}`);
		}

		const request = new Request(
			fileListRepo.replace("%sha%", node.sha),
			{ headers }
		);

		fetch(request)
			.then((response) => response.json())
			.then(({tree}) => {
				tree = tree.map(t => {
					t["id"] = uniqueid();
					return t;
				});
				const newTree = findingChild(this.state.tree, node.id, tree);
				this.setState({ tree: newTree });
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
											(branch) => <option value={branch.name}>{branch.name}</option>
										)}
									</select>
								</div>

								<div
									style={{
										flex: "1",
										overflow: "auto",
										height: "100%",
										padding: "10px"
									}}
								>
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
												<h4>Tree navigator for Github</h4>
												<span
													style={{
														marginTop: "50px"
													}}
												>Select any file from left tree view</span>
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