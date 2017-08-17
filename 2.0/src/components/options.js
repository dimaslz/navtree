import { h, Component } from 'preact';
import { Link } from 'preact-router';
// import style from './style.less';

export default class Home extends Component {
	componentDidMount() {
		console.log("AAAAABB")
	}
	render() {
		return (
			<div>
				<h1>Home</h1>
				<Link href="/home">home</Link>
				<p>This is the Home component.</p>
			</div>
		);
	}
}