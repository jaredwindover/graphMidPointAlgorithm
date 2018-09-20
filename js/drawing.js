const drawCircle = (context, radius, point) => {
	context.beginPath();
	context.arc(point.x, point.y, radius, 0, 2*Math.PI);
	context.fill();
	context.stroke();
};

const drawLine = (context, point, otherPoint) => {
	context.beginPath();
	context.moveTo(point.x,point.y);
	context.lineTo(otherPoint.x,otherPoint.y);
	context.stroke();
};

const drawPoints = (context, points) => {
	for (const point of points) {
		drawCircle(context, 20, point);
	}
};

const drawMidPoints = (context, midPoints) => {
	for (const midPoint of midPoints) {
		drawCircle(context, 10, midPoint.p);
	}
};

const drawTraces = (context, traces, pairs) => {
	for (var i = 0; i < traces[0].length; i++) {
		for (var j = 0; j < traces.length; j++) {
			drawCircle(context, 2, traces[j][i]);
			drawLine(context, traces[j][i], traces[pairs[j]][i]);
		}
	}
};

const	drawFollows = (context, points, pairs) => {
	for (var i = 0; i < points.length; i++) {
		drawLine(context, points[i], points[pairs[i]]);
	}
};

const drawEdges = (context, points, edges) => {
	for (const edge in edges ) {
		const others = edges[edge];
		for (const otherEdge of others ) {
			const edgePoint = points[edge];
			const otherEdgePoint = points[otherEdge];
			drawLine(context, edgePoint, otherEdgePoint);
		}
	}
};

const clear = (context, {height, width}) => context.clearRect(
	0,0, width, height
);


export default {
	drawPoints,
	drawMidPoints,
	drawEdges,
	drawTraces,
	drawFollows,
	clear
};
