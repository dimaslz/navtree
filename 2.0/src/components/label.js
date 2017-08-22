import { h, Component } from 'preact';

export default class Label extends Component {
	constructor() {
		super();

		this._handleClick = this._handleClick.bind(this);
	}

	_handleClick() {
		const { node, onClick } = this.props;
		onClick(node);
	}

	render({node}) {

		return (
      <span class="node" onClick={this._handleClick}>
        {node.path}
      </span>
		);
	}
}