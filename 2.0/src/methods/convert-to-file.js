const convertFile = function(node, data) {
	if (/gif|png|jpg|jpeg/i.test(node.path)) {
		return escape(window.atob(data.content));
	}

	return decodeURIComponent(escape(window.atob(data.content)));
};

module.exports = convertFile;