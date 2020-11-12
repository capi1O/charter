// from https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle

const polarToCartesian = (center, radius, angleInDegrees) => {
	var angleInRadians = (angleInDegrees) * Math.PI / 180.0; // (angleInDegrees - 90) * Math.PI / 180.0;
	const { x, y } = center;

	return ({
		x: x + (radius * Math.cos(angleInRadians)),
		y: y + (radius * Math.sin(angleInRadians))
	});
};

const svgArc = (center, radius, angleStart, angleValue, follow = false) => {

	const angleEnd = angleStart + angleValue;

	const start = polarToCartesian(center, radius, angleEnd);
	const end = polarToCartesian(center, radius, angleStart);

	// chose between smallest and bigger arc (see https://github.com/waldyrious/understand-svg-arcs)
	let size = Math.abs(angleEnd - angleStart) <= 180 ? '0' : '1';

	// chose between smallest and bigger arc (see https://github.com/waldyrious/understand-svg-arcs)
	const direction = angleValue > 0 ? '0' : '1';
	// const direction = follow ? '1' : '0';

	// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
	const path = `${follow ? 'L' : 'M'} ${start.x} ${start.y} A ${radius} ${radius} 0 ${size} ${direction} ${end.x} ${end.y}`;

	return ({ path, apexes: [start, end] });
};

export { polarToCartesian, svgArc };
