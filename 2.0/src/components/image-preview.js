import { h, Component } from "preact";

export default class ImagePreview extends Component {
	constructor() {
		super();
		this.state = {
			filePreview: null
		};
	}

	componentDidMount() {
		this.setState({
			filePreview: "data:image/*;base64," + this.props.filePreview
		});
	}

	componentWillUnmount() {
		this.setState({
			filePreview: null
		});
	}

	render(props, state) {
		const { filePreview } = state;

		if (!filePreview) return null;

		return (
			<div
				id="content-image"
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flex: "1"
				}}
			>
				<img
					style={{
						maxWidth: "100%",
						maxHeight: "100%",
						display: "grid",
						verticalAlign: "middle",
						padding: "10px",
						margin: "auto"
					}}
					src={filePreview}
					alt=""
				/>
			</div>
		);
	}
}
