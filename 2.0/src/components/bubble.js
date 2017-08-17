import { h, Component } from 'preact';

import bubbleImage from '../assets/images/bubble.png';

export default class Bubble extends Component {

	render({onClick}) {

		return (
      <div
				style={{
					position: "fixed",
					right: "20px",
					bottom: "20px",
					width: "35px",
					height: "35px",
					zIndex: "100"
				}}
				id="nt_bubble"
				onClick={onClick}>
				<img
					style={{
						width: "35px",
						height: "35px",
						cursor: "pointer"
					}}
					src={bubbleImage}
					alt="Open Navtree"
				/>
			</div>
		);
	}
}