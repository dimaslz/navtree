import { h, Component } from 'preact';
import { css } from 'glamor';

const linesStyle = css({
	display: "flex",
	flexDirection: "column",
	fontSize: "12px",
	lineHeight: "14px",
	marginRight: "10px",
	alignItems: "flex-end",
	position: "absolute",
	left: "0",
	top: "0",
	backgroundColor: "white"
});

const lineStyle = css({
	paddingRight: "5px",
	backgroundColor: "white",
	width: "100%",
	textAlign: "right",
	padding: "0 5px",
	display: "block"
});

export default class NumberLine extends Component {

	render({lines}) {

		return (
      <div
				id="file-lines"
				className={linesStyle}
			>
				{Array(lines).fill().map((v, i) => {
					return <span
						className={lineStyle}
					>
						{i+1}
					</span>;
				})}
			</div>
		);
	}
}