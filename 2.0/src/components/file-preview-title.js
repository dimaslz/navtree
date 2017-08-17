/*global chrome*/
import { h, Component } from 'preact';
import { css } from 'glamor';

const downloadIcon = chrome.extension.getURL("assets/images/download.svg");
const downloadIconHover = chrome.extension.getURL("assets/images/download_hover.svg");

export default class FilePreviewTitle extends Component {

	render({title, fileDownloadUrl}) {

		return (
      <div
				style={{
					width: "100%",
					padding: "10px",
					display: "flex",
					alignItems: "center",
					fontSize: "20px",
					fontWeight: "200",
					backgroundColor: "#24292e",
					color: "rgba(255,255,255,0.75)",
					lineHeight: "30px",
					height: "50px"
				}}>
					{title}
				<a
					href={fileDownloadUrl}
					download={title}
					title="Download file"
				>
					<button
						type="button"
						className={css({
							position: "absolute",
							right: "10px",
							top: "10px",
							width: "30px",
							height: "30px",
							background: `transparent url('${downloadIcon}') no-repeat 0px 0px`,
							backgroundSize: "30px 30px",
							border: "0px",
							':hover': {
								background: `transparent url('${downloadIconHover}') no-repeat 0px 0px`,
								backgroundSize: "30px 30px"
							}
						})} />
				</a>
			</div>
		);
	}
}