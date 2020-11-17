import $ from 'jquery';
import DOMElement from './DOMElement.js';

class Tooltip {
	
	constructor (containerId, color, value, labelClass, level, id, root) {
		this.color = color;
		this.value = value;
		this.labelClass = labelClass;
		this.id = `${level}-${id}-tooltip`;
		this.root = root;
		this.containerId = containerId;
	}

	draw = () => {
		const tooltip = new DOMElement('div', {
			id: this.id,
			class: 'tooltip',
			style: 'display: none; opacity: 0;'
		});
		const header = new DOMElement('div', {
			class: `header ${this.labelClass}`,
			style: `background-color: ${this.color};`
		});
		header.element.textContent = this.value;
		tooltip.appendChild(header);
		const content = new DOMElement('p', { class: 'content' });
		const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
		content.element.textContent = `${text.slice(0, 250)}...`;
		tooltip.appendChild(content);
		tooltip.appendTo(this.containerId);
	};

	hide = () => {
		const $tooltip = $(`#${this.id}`);
		$tooltip.fadeTo(1000, 0.0, () => $tooltip.css('display', 'none'));
	};

	show = () => {
		$(`#${this.id}`).css('display', 'block').fadeTo(400, 1.0);
	};
}

//@tood breadcrumb : root > child > child

export default Tooltip;
