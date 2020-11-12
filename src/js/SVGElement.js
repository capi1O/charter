class SVGElement {
	constructor (type, attributes = [], events = []) {

		const element = document.createElementNS('http://www.w3.org/2000/svg', type);

		Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
			element.setAttributeNS(null, attributeName, attributeValue);
		});

		Object.entries(events).forEach(([eventName, eventCallback]) => {
			element.addEventListener(eventName, eventCallback);
		});

		this.element = element;
	}

	appendTo = (svgId) => {
		document.getElementById(svgId).appendChild(this.element);
	};

	appendChild = (child) => {
		this.element.appendChild(child.element);
	};
}

export default SVGElement;