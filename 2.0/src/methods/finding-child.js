const findingChild = function(tree, id, child) {

	return tree.map((node, i) => {
		if (node.id == id) {
			node["child"] = child;
			node["compressed"] = !node["compressed"];
			return node;
		}

		if (node.child) {
			findingChild(node.child, id, child);
		}

		return node;
	});
};

module.exports = findingChild;