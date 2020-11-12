import $ from 'jquery';
import { largestRect } from 'd3plus-shape';
import Color from 'color';
import SVGElement from './SVGElement.js';
import DOMElement from './DOMElement.js';
import centroid from 'polygon-centroid';
import { polarToCartesian, svgArc } from './svg.js';
import { effectHandler } from './helpers.js';

class Slice {
	
	constructor (
		svgId,
		level,
		value,
		angleStart,
		angleValue,
		innerRadius,
		outerRadius,
		doughnutRadius,
		color,
		label,
		labelAngle,
		labelClass = 'slice-text',
		id,
		onHoverCallback,
		onHoverEffect,
		onClickCallback,
		onClickEffect,
		childrenSlices) {

		if (angleValue == 360) angleValue = 359.99; // ugly hack
		const doughnutCenter = { x: doughnutRadius, y: doughnutRadius };
		this.doughnutCenter = doughnutCenter;
		const { path: innerPath, apexes: innerApexes } = svgArc(doughnutCenter, innerRadius, angleStart, angleValue);
		const { path: outerPath, apexes: outerApexes } = svgArc(doughnutCenter, outerRadius, angleStart + angleValue, angleValue * -1, true);
		this.path = `${innerPath} ${outerPath}`;
		const points = [...innerApexes, ...outerApexes];
		this.centroid = centroid(points);
		this.largestRect = largestRect(points.map(({ x, y }) => ([Math.round(x), Math.round(y)])), {
			angle: typeof labelAngle === 'number' ? labelAngle : 0,
			minAspectRatio: 0.5,
			// maxAspectRatio: 5,
			nTries: 100,
			tolerance: 0.001
		});

		this.points = points;
		this.svgId = svgId;
		this.level = level;
		this.color = color;
		this.label = label;
		this.labelAngle = labelAngle;
		this.labelClass = labelClass;
		this.realValue = value;
		this.id = `${level}-${id}`;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.angleStart = angleStart;
		this.angleValue = angleValue;
		this.onHoverCallback = onHoverCallback;
		this.onHoverEffect = onHoverEffect;
		this.onClickCallback = onClickCallback;
		this.onClickEffect = onClickEffect;
		this.childrenSlices = childrenSlices;
		this.clicked = false;
	}

	// id = () => `${this.level}-${this.id}`;


	translationVector = (shift = 10) => {
		const angle = this.angleStart + this.angleValue / 2;
		const directionPoint = polarToCartesian(this.doughnutCenter, shift, angle);
		return ({ x: directionPoint.x - this.doughnutCenter.x, y: directionPoint.y - this.doughnutCenter.y });
	};

	onClick = ({ target }) => { // use currentTarget ?
		// const sliceId = $(target).attr('id'); // const sliceId = target.getAttributeNS(null, 'id');
		// console.log(`${sliceId} clicked`);
		// console.log(this);

		effectHandler(this.onClickEffect, {
			expand: (effectObj) => {
				const { toLevel } = effectObj;

				const toggleChildren = (childrenSlices, show) => {
					childrenSlices.forEach(childSlice => {
						if (show) childSlice.show();
						else childSlice.hide();

						if (childSlice.level < toLevel) toggleChildren(childSlice.childrenSlices, show);
					});
				};

				toggleChildren(this.childrenSlices, !this.clicked);
				this.clicked = !this.clicked;
			}
		});

		if (this.onClickCallback) this.onClickCallback();
	};

	onHover = (flag) => ({ target }) => { // use currentTarget ?
		// const sliceId = $(target).attr('id'); // const sliceId = target.getAttributeNS(null, 'id');
		// console.log(`${sliceId} hovered ${flag ? 'in' : 'out'}`);

		effectHandler(this.onHoverEffect, {
			darken: () => $(target).fadeTo(300, flag ? 0.5 : 1.0),
			shadow: () => $(target).css('filter', flag ? `url(#${this.id}-shadow)` : 'none'),
			slide: () => {
				const { x, y } = this.translationVector(10);
					if (flag) $(target).css('transform', `translate(${x}px, ${y}px)`);
					else $(target).css('transform', 'translate(0px, 0px)');
				}
		});

		if (this.onHoverCallback) this.onHoverCallback();
	};


	drawPath = (svgId, gradient) => {
		const path = new SVGElement('path', {
			id: `${this.id}-path`,
			d: this.path,
			stroke: this.color,
			'stroke-width': 1,
			opacity: 1,
			fill: gradient ? `url(#${this.id}-gradient)` : this.color,
			valueAngle: this.angleValue,
			valueLabel: this.label,
			valueReal: this.realValue,
			valueParent:  this.id
		}, {
			click: this.onClick,
			mouseover: this.onHover(true),
			mouseout: this.onHover(false)
		});
		this.container.appendChild(path);
	};

	drawGradient = (gradient) => {
		let angleShift;
		switch (typeof gradient) {
			case 'string':
				angleShift = gradient === 'radial' ? 90 : 0;
				break;
			case 'number':
				angleShift = gradient;
				break;
			default:
				angleShift = 0;
				break;
		}

		const gradientId = `${this.id}-gradient`; // cannot define at level level because gradientTransform attribute is specific
		const defs = new SVGElement('defs', {}); // TODO : reus <defs /> if already one (multiple <defs /> are valid though https://stackoverflow.com/questions/44226035/are-multiple-defs-allowed-in-svg-documents)
		const linearGradient = new SVGElement('linearGradient', {
			id: gradientId,
			gradientTransform: `rotate(${this.angleStart + angleShift} 0.5 0.5)`
		});
		const stop1 = new SVGElement('stop', { offset: '0%', 'stop-color': Color(this.color).darken(0.5) });
		const stop2 = new SVGElement('stop', { offset: '100%', 'stop-color': this.color });
		linearGradient.appendChild(stop1);
		linearGradient.appendChild(stop2);
		defs.appendChild(linearGradient);
		this.container.appendChild(defs);
	};

	drawDot = (point, size = 5) => {
		const dot = new SVGElement('circle', {
			cx: point.x,
			cy: point.y,
			r: size,
			fill: 'black'
		});

		this.container.appendChild(dot);
	};

	drawText = (text) => {
		const sliceHeight = this.outerRadius - this.innerRadius;

		// A. radial text
		if (typeof this.labelAngle === 'string' && this.labelAngle === 'radial') {

			// 1. determine radius used to draw text (middle, bottom or top)
			const height = this.outerRadius - this.innerRadius;
			const padding = height * 0.15;
			const shift = height * 0.10; // fix font alignement
			const startRadius = this.outerRadius - padding - shift;
			const endRadius = this.innerRadius + padding - shift;
			const fontSize = `${(startRadius - endRadius) * 1.2}px`;

			// 2. build arc path
			const { path: pathString } = svgArc(this.doughnutCenter, startRadius, this.angleStart, this.angleValue);
			const textpathId = `${this.id}-textpath`;
			const defs = new SVGElement('defs', {}); // TODO : reus <defs /> if already one (multiple <defs /> are valid though https://stackoverflow.com/questions/44226035/are-multiple-defs-allowed-in-svg-documents)
			const path = new SVGElement('path', { d: pathString, id: textpathId, fill: 'none', stroke: 'black' });
			defs.appendChild(path);
			this.container.appendChild(defs);

			// 3. build textpath
			const text = new SVGElement('text', { 'text-anchor': 'middle' });
			const textPath = new SVGElement('textPath', { href: `#${textpathId}`, class: this.labelClass, startOffset: '50%', 'font-size': fontSize });
			textPath.element.textContent = this.label;
			text.appendChild(textPath);
			this.container.appendChild(text);
		}

		// B. Text in rect
		else {
			let x, y, width, height;

			// B1. central item is just a circle
			if (this.level === 0) {
				const size = sliceHeight * Math.SQRT1_2;
				x = this.doughnutCenter.x - size;
				y = this.doughnutCenter.y - size;
				width = size * 2;
				height = size * 2;
			}

			// B2. slice is convex => place label in middle (centroid) with width = slice radial size
			else if (Math.abs(this.angleValue) > 90) {
				const middleRadius = this.innerRadius + sliceHeight / 2;
				const middleAngle = this.angleStart + this.angleValue / 2;
				const center = polarToCartesian(this.doughnutCenter, middleRadius, middleAngle);
				const size = sliceHeight * Math.SQRT1_2;
				x = center.x - size / 2;
				y = center.y - size / 2;
				width = size;
				height = size;
			}

			// B3. Slice is not convex => calculate largest rect
			else {
				if (this.largestRect) {
					const { cx, cy, width: rWidth, height: rHeight } = this.largestRect;
					x = cx - rWidth / 2,
					y = cy - rHeight / 2,
					width = rWidth;
					height = rHeight;
				}
				// convex item not in center
				else {
					console.error(`could not find largestRect for non convex slice ${this.id}`);
					return;
				}
			}

			const foreignObject = new SVGElement('foreignObject', { x, y, width, height });

			const body = new DOMElement('body', {
				xmlns: 'http://www.w3.org/1999/xhtml',
				style: `transform: rotate(${this.labelAngle}deg)`
			});
			foreignObject.appendChild(body);

			const div = new DOMElement('div');
			body.appendChild(div);

			const span = new DOMElement('span', { class: this.labelClass });
			span.element.textContent = text;
			div.appendChild(span);

			this.container.appendChild(foreignObject);
		}
	};

	prepareEffect = (hidden) => {

		if (this.onClickCallback || this.onClickEffect) $(`#${this.id}-path`).css('cursor', 'pointer');

		// effectHandler(this.onClickEffect, { expand: () => {} });

		// will be expanded
		if (hidden) {
			$(`#${this.id}-path`).css('transition', 'transform 0.8s ease-in-out').css('transform-origin', '50% 50%').css('transform', 'scale(0)').css('opacity', 0);
			// transform-origin is relative to SVG element, cf https://css-tricks.com/transforms-on-svg-elements/
		}

		effectHandler(this.onHoverEffect, {
			shadow: () => {
				const shadowId = `${this.id}-shadow`;
					const defs = new SVGElement('defs', {}); // TODO : reus <defs /> if already one (multiple <defs /> are valid though https://stackoverflow.com/questions/44226035/are-multiple-defs-allowed-in-svg-documents)
					const shadow = new SVGElement('filter', { id: shadowId, height: '130%' });

					const blur = new SVGElement('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '3' });
					const { x, y } = this.translationVector(10);
					const offset = new SVGElement('feOffset', { dx: x * - 1, dy: y * -1, result: 'offsetblur' });
					const transfer = new SVGElement('feComponentTransfer', {});
					const func = new SVGElement('feFuncA', { type: 'linear', slope: '0.5' }); // shadow opacity
					transfer.appendChild(func);
					const merge = new SVGElement('feMerge', {});
					const node1 = new SVGElement('feMergeNode', {});
					const node2 = new SVGElement('feMergeNode', { in: 'SourceGraphic' });
					merge.appendChild(node1);
					merge.appendChild(node2);

					defs.appendChild(shadow);
					shadow.appendChild(blur);
					shadow.appendChild(offset);
					shadow.appendChild(transfer);
					shadow.appendChild(merge);
					this.container.appendChild(defs);
			},
			slide: () => $(`#${this.id}-path`).css('transition', 'transform 0.8s ease-in-out')
		})
	};

	hide = () => {
		$(`#${this.id}-path`).fadeTo(400, 0.0).css('transform', 'scale(0)');
	};

	show = () => {
		$(`#${this.id}-path`).fadeTo(400, 1.0).css('transform', 'scale(1)');
	};

	draw = (hidden = false, options) => {
		const defaultOptions = { drawLabel: true, drawCenter: false, drawApexes: false, gradient: false };
		const opts = { ...defaultOptions, ...options };
		const { drawLabel, drawCenter, drawApexes, gradient } = opts;

		const container = new SVGElement('g', { id: this.id });
		this.container = container;
		container.appendTo(this.svgId);

		if (drawCenter) this.drawDot(this.centroid);
		if (drawApexes) this.points.forEach(point => this.drawDot(point));
		if (gradient) this.drawGradient(gradient);
		this.drawPath(this.svgId, gradient);
		this.prepareEffect(hidden);
		if (drawLabel) this.drawText(this.label);
	};
}


export default Slice;