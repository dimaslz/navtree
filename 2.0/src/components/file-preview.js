/*global hljs: function*/
/*eslint no-undef: "error"*/
import { h, Component } from 'preact';

import NumberLine from './number-line';

export default class FilePreview extends Component {
	constructor() {
		super();
		this.state = {
			filePreview: null,
			language: null,
			numberOfLines: 0,
			linesCounterAnchor: 0
		};
	}

	componentDidMount() {
		hljs.initHighlightingOnLoad();
		hljs.configure({useBR: true});

		const codeContent = hljs.highlightAuto(this.props.filePreview);

		codeContent.value = codeContent.value.replace(/\n/ig, "<br/>");
		// const numberOfLines = codeContent.value.match(/\\n/ig).length +1;
		const numberOfLines = codeContent.value.match(/<br\/>/ig).length +1;
		this.props.doGetFileLines(numberOfLines);
		this.setState({
			filePreview: codeContent.value,
			language: codeContent.language,
			numberOfLines
		});
	}

	componentWillUnmount() {
		this.setState({
			filePreview: null,
			language: null,
			numberOfLines: 0
		});
	}

	render(props, state) {
		const { filePreview, language, numberOfLines, linesCounterAnchor } = state;

		if (!filePreview) return null;

		return (
			<span style={{
				position: "relative",
				display: "flex",
				flex: "1",
				overflowX: "scroll",
				margin: "10px"
			}}>
				<NumberLine
					lines={numberOfLines}
					ref={e => this.setState({linesCounterAnchor: e})}
				/>
				<span style={{
					position: "relative",
					display: "flex",
					flex: "1",
					overflowY: "hidden",
					overflowX: "scroll",
					height: linesCounterAnchor ? `${linesCounterAnchor.base.clientHeight}px` : '0',
					marginLeft: linesCounterAnchor ? `${linesCounterAnchor.base.clientWidth+10}px` : '0'
				}}>
					<pre
						style={{
							display: "flex",
							flex: "1"
						}}
					>
						<code
							id="code"
							ref={(code) => this.code = code}
							class={language}
							dangerouslySetInnerHTML={{__html: filePreview}}
						/>
					</pre>
				</span>
			</span>
		);
	}
}
