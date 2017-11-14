export default class Graph {
	constructor() {
		this.points = [];
		this.inEdges = [];
		this.outEdges = [];
	}

	addPoint(p) {
		this.points.push(p);
	}

}
