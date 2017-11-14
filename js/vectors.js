const difference = (point, otherPoint) => ({
	x : otherPoint.x - point.x,
	y: otherPoint.y - point.y
});

const sum = (point, otherPoint) => ({
	x: otherPoint.x + point.x,
	y: otherPoint.y + point.y
});

const divScalar = (point, scalar) => ({
	x : point.x / scalar,
	y: point.y / scalar
});

const timesScalar = (point, scalar) => ({
	x : point.x * scalar,
	y: point.y * scalar
});

const squaredMagnitude = point => Math.pow(point.x, 2) + Math.pow(point.y, 2);

const squaredDistance = (point, otherPoint) => squaredMagnitude(
	difference(point, otherPoint)
);

const canonical = {
	zero: {x: 0, y: 0},
	up: {x: 0, y: 1},
	down: {x: 0, y: -1},
	left: {x: -1, y: 0},
	right: {x: 1, y: 0}
};

export default {
	canonical,
	difference,
	sum,
	divScalar,
	timesScalar,
	squaredDistance
};
