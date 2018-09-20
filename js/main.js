import drawing from './drawing';
import vectors from './vectors';
import {getRandomInt} from './utilities';

const constants = {};

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

const init = ({numPoints = 5} = {}) => {
	const initPoints = (numPoints, canvas) => {
		const points = [];
		for (var i = 0; i < numPoints; i++) {
			const x = Math.random() * canvas.width;
			const y = Math.random() * canvas.height;
			points.push({x, y});
		}
		return points;
	};

	const initTrace = (points) => {
		const traces = [];
		for (const point of points) {
			traces.push([point]);
		}
		return traces;
	};

	const initPairs = (numPoints) => {
		const res = {};
		for (var i = 0; i< numPoints; i++) {
			res[i] = (i + 1) % numPoints;
		}
		return res;
	};

	const canvas = document.querySelector('canvas');
	resizeCanvas(canvas);
	const context = canvas.getContext('2d');
	const points = initPoints(numPoints, canvas);
	const velocities = points.map(() => vectors.canonical.zero);
	const pairs = initPairs(numPoints);
	console.log(pairs);
	const traces = initTrace(points);
	return {
		canvas,
		context,
		points,
		velocities,
		traces,
		pairs
	};
};

var {
	canvas,
	context,
	points,
	velocities,
	traces,
	pairs
} = init({numPoints : Math.floor(Math.random()*27) + 3});

const getPoint = v => points[v];

const update = canvas => {

	// velocities per point
	const velocities = [];
	for (let i = 0; i < points.length; i++) {
		const point = getPoint(i);
		const otherPoint = getPoint(pairs[i]);
		velocities.push(
			vectors.timesScalar(
				vectors.difference(point, otherPoint),
				1000 / Math.sqrt(vectors.squaredDistance(point, otherPoint))
			)
		);
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

	// update traces
	for (let i = 0; i < points.length; i++) {
		traces[i].push(getPoint(i));
	}
};

function draw(context) {
	drawing.drawTraces(context, traces, pairs);
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
