import drawing from './drawing';
import vectors from './vectors';
import {getRandomInt} from './utilities';

const constants = {
	attraction: 1,
	attractionDivisor: 20,
	repulsion: 100,
	barrierRepulsion: 1000,
	barrierWidth: 10,
	midPoint2MidPointRepulsion: 100,
	midPoint2PointRepulsion: 100
};

var timeStep = 0.01;
var fastForward = 1;

function resizeCanvas(canvas) {
	console.dir({
		w: window.innerWidth,
		h: window.innerHeight
	});
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function getMidPoints(edges, points) {
	const getMidPoint = (point, otherPoint) => vectors.divScalar(
		vectors.sum(point, otherPoint),
		2
	);

	return edges.reduce((o, e, v) => e.reduce((o, otherPointI, i) => {
		o.push({p: getMidPoint(points[v], points[otherPointI]), a: v, b: i});
		return o;
	}, o), []);
}

const init = ({numPoints = 20, numEdges = 50} = {}) => {
	const initPoints = (n, canvas) => {
		var points = [];
		for (var i = 0; i < n; i++) {
			points[i] = {
				x: getRandomInt(0,canvas.width),
				y: getRandomInt(0,canvas.height)
			};
		}
		return points;
	};

	const addHalfEdge = (edges, a, b) => {
		if (!(a in edges)) {
			edges[a] = [b];
		} else {
			edges[a].push([b]);
		}
		return edges;
	};

	const initEdges = (n,k) => {
		return Array(n).fill().reduce(
			({inEdges, outEdges}) => {
				const left = getRandomInt(0, k);
				let right = getRandomInt(0, k - 1);
				if (right >= left) {
					right += 1;
				}
				return {
					outEdges: addHalfEdge(outEdges, left, right),
					inEdges: addHalfEdge(inEdges, right, left)
				};
			}, {inEdges: [], outEdges: []}
		);
	};
	const canvas = document.querySelector('canvas');
	resizeCanvas(canvas);
	const context = canvas.getContext('2d');
	const points = initPoints(numPoints, canvas);
	const velocities = points.map(() => vectors.canonical.zero);
	const forces = points.map(() => vectors.canonical.zero);
	const edgesPair = initEdges(numEdges, numPoints);
	const {outEdges, inEdges} = edgesPair;
	const midPoints = getMidPoints(outEdges, points);
	return {
		canvas,
		context,
		points,
		velocities,
		forces,
		outEdges,
		inEdges,
		midPoints
	};
};

var {
	canvas,
	context,
	points,
	midPoints,
	inEdges,
	outEdges,
	forces,
	velocities
} = init();

const getPoint = v => points[v];

const update = canvas => {
	// forces per point
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const ips = inEdges[i] == undefined ? [] : inEdges[i].map(getPoint);
		const ops = outEdges[i] == undefined ? [] : outEdges[i].map(getPoint);
		const otherPoints = ips.concat(ops);
		forces[i] = vectors.canonical.zero;
		// point on point attractive forces (edges)
		for (const otherPoint of otherPoints) {
			const d2 = vectors.squaredDistance(point, otherPoint);
			const d = Math.sqrt(d2);
			if (d != 0) {
				const dir = vectors.divScalar(
					vectors.difference(point, otherPoint), d
				);
				forces[i] = vectors.sum(
					forces[i],
					vectors.timesScalar(
						dir, constants.attraction*Math.log(d/constants.attractionDivisor)
					)
				);
			}
		}
		// point on point repulsive forces
		for (const otherPoint of points) {
			const d2 = vectors.squaredDistance(point, otherPoint);
			if (d2 != 0) {
				const d = Math.sqrt(d2);
				const dir = vectors.divScalar(
					vectors.difference(point, otherPoint), d
				);
				const newForce = vectors.timesScalar(dir, -constants.repulsion/d2);
				forces[i] = vectors.sum(forces[i], newForce);
			}
		}
		const barrierForce = (dir, d) => {
			const d2 = Math.pow(d,2);
			if (d2 != 0) {
				return vectors.timesScalar(dir, -constants.barrierRepulsion/d2);
			}
			return vectors.canonical.zero;
		};
		// barrier repulsive forces
		forces[i] = [
			barrierForce(vectors.canonical.down, point.y),
			barrierForce(vectors.canonical.up, canvas.height - point.y),
			barrierForce(vectors.canonical.left, point.x),
			barrierForce(vectors.canonical.right, canvas.width - point.x)
		].reduce(vectors.sum, forces[i]);
	}

	// midPoint forces
	for (const midPoint of midPoints) {
		const mp = midPoint.p;
		// midPoint on midPoint repulsive forces
		for (const otherMidPoint of midPoints) {
			const omp = otherMidPoint.p;
			const d2 = vectors.squaredDistance(mp, omp);
			if (d2 != 0) {
				const d = Math.sqrt(d2);
				const dir = vectors.divScalar(vectors.difference(mp, omp), d);
				const newForce = vectors.timesScalar(
					dir, -constants.midPoint2MidPointRepulsion/(2*d2)
				);
				forces[midPoint.a] = vectors.sum(forces[midPoint.a], newForce);
				forces[midPoint.b] = vectors.sum(forces[midPoint.b], newForce);
			}
		}
		// point on midPoint repulsive forces
		for (const otherPoint of points) {
			const d2 = vectors.squaredDistance(mp, otherPoint);
			if (d2 != 0) {
				const d = Math.sqrt(d2);
				const dir = vectors.divScalar(vectors.difference(mp, otherPoint), d);
				const newForce = vectors.timesScalar(
					dir, -constants.midPoint2PointRepulsion/(2*d2)
				);
				forces[midPoint.a] = vectors.sum(forces[midPoint.a], newForce);
				forces[midPoint.b] = vectors.sum(forces[midPoint.b], newForce);
			}
		}
	}

	// update velocities with forces
	for (let i = 0; i < points.length; i++) {
		velocities[i] = vectors.sum(velocities[i], forces[i]);
	}

	// update positions with velocities
	for (let i = 0; i < points.length; i++) {
		const displacement = vectors.timesScalar(velocities[i], timeStep);
		points[i] = vectors.sum(points[i], displacement);
		if (points[i].x < constants.barrierWidth) {
			points[i].x = constants.barrierWidth;
			velocities[i].x = 0;
		}
		if (points[i].x > canvas.width- constants.barrierWidth) {
			points[i].x = canvas.width - constants.barrierWidth;
			velocities[i].x = 0;
		}
		if (points[i].y < constants.barrierWidth) {
			points[i].y = constants.barrierWidth;
			velocities[i].y = 0;
		}
		if (points[i].y > canvas.height - constants.barrierWidth) {
			points[i].y = canvas.height - constants.barrierWidth;
			velocities[i].y = 0;
		}
	}

	// update midPoint positions
	midPoints = getMidPoints(outEdges, points);
};

function draw(context) {
	context.fillStyle = 'red';
	drawing.drawPoints(context, points);
	drawing.drawEdges(context, points, outEdges);
	context.fillStyle = 'blue';
	drawing.drawMidPoints(context, midPoints);
}

const iterate = n => {
	if (n >= 0) {
		update(canvas);
		drawing.clear(context, canvas);
		draw(context);
		setTimeout(() => iterate(n - 1), 1000*timeStep/fastForward);
	}
};

function main() {
	draw(context);
	iterate(40000);
	draw(context);
}

window.addEventListener('resize', () => resizeCanvas(canvas), false);
main();
