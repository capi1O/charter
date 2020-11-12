class DOMElement {
	constructor (type, attributes = [], events = []) {

		const element = document.createElement(type);

		Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
			element.setAttribute(attributeName, attributeValue);
		});

		Object.entries(events).forEach(([eventName, eventCallback]) => {
			element.addEventListener(eventName, eventCallback);
		});

		this.element = element;
	}

	appendTo(id) {
		document.getElementById(id).appendChild(this.element);
	}

	appendChild(child) {
		this.element.appendChild(child);
	}
}

export default DOMElement;