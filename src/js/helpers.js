const groupBy = (items, key) => items.reduce((result, item) => ({ ...result, [item[key]]: [...(result[item[key]] || []), item] }), {});

const cssSelectorEscape = (string) => {
	if (string) {
		// const cssSelectorRegex = /-?[_a-zA-Z]+[_a-zA-Z0-9-]*/; // from https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
		const cssSelectorRegex = /([^a-z0-9]+)/gi;
		return string.replace(cssSelectorRegex, '-');
	}
	else return '';
};

const isFunction = (functionToCheck) => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

const effectHandler = (onEffect, handler) => {

	// console.log(onEffect, handler);
	
	if (onEffect && Array.isArray(onEffect)) onEffect.forEach(effectStringOrObj => {
		// handle string or object effect
		let effectObj = {};
		if (typeof effectStringOrObj === 'string') effectObj.effect =  effectStringOrObj;
		else if (typeof effectStringOrObj !== 'object' || effectStringOrObj === null) return;
		else effectObj = effectStringOrObj;
		switch (effectObj.effect) {
			case 'expand': handler.expand && handler.expand(effectObj); break;
			case 'darken': handler.darken && handler.darken(effectObj); break;
			case 'shadow': handler.shadow && handler.shadow(effectObj); break;
			case 'slide': handler.slide && handler.slide(effectObj); break;
			case 'tooltip': handler.tooltip && handler.tooltip(effectObj); break;
			default: break;
		}
	});
};

export { groupBy, cssSelectorEscape, isFunction, effectHandler };