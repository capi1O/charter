import Slice from './Slice.js';
import { groupBy, cssSelectorEscape as id, isFunction, effectHandler } from './helpers';

const buildItemsByLevel = (levels, items) => {

	const itemsByLevel = {};
	const levelKeys = levels.map(level => level.key);

	levels.reverse().forEach((levelProps, index) => {
		const levelNumber = levels.length - index - 1;

		// console.log('levelNumber', levelNumber);

		const {
			key: levelKey,
			size: levelSize,
			labelClass,
			color,
			gradient,
			onHoverCallback,
			onClickCallback,
			...levelBasisProps // ex radius, labelAngle, onHoverEffect, onClickEffect
		} = levelProps;

		const uniqueValues = [...new Set(items.map(item => item[levelKey]))];

		const previousKey = levelNumber !== 0 ? levelKeys[levelNumber - 1] : false;

		const size = (id) => {

			const nextLevelNumber = levelNumber < (levelKeys.length - 1) ? levelNumber + 1 : null;

			if (levelSize) return levelSize; // value determined on level basis
			else if (nextLevelNumber) {
				const nextLevelItems = itemsByLevel[nextLevelNumber].items;
				const children = nextLevelItems.filter(itm => itm.root === id);
				const childrenTotalSize = children.reduce((acc, child) => acc + child.size, 0);
				const nextLevelTotalSize = nextLevelItems.reduce((acc, item) => acc + item.size, 0);

				return childrenTotalSize / nextLevelTotalSize;
			}
			else return 1;
		};

		itemsByLevel[levelNumber] = {
			key: levelKey,
			...levelBasisProps,
			items: uniqueValues.map(value => {

				const item = items.find(item => item[levelKey] === value);

				const itemWithData = {
					...item,
					id: id(value),
					value,
					root: previousKey && id(item[previousKey]),
					size: size(id(value))
				};

				return ({
					...itemWithData,
					// item basis props
					labelClass: isFunction(labelClass) ? labelClass(itemWithData) : labelClass,
					color: isFunction(color) ? color(itemWithData) : color,
					gradient: isFunction(gradient) ? gradient(itemWithData) : gradient,
					onHoverCallback: onHoverCallback && onHoverCallback(itemWithData),
					onClickCallback: onClickCallback && onClickCallback(itemWithData)
				})
			})
		};
	});

	return itemsByLevel;
};


class Doughnut {
	constructor (svgId = 'charter', levels, items) {

		const svgElement = document.getElementById(svgId);
		if (svgElement === null) {
			console.error(`cannot find SVG element with ${svgId}`)
			throw '`id` must be a valid SVG element';
		}
		const width = svgElement.getAttribute('viewBox').split(' ')[3];

		const itemsByLevel = buildItemsByLevel(levels, items);
		// console.log('itemsByLevel', itemsByLevel);

		const maxSize = (width / 2) * 90 / 100;
		const minSize = 0; //(width / 2) * 10 / 100;
		const defaultRadius = (maxSize - minSize) / levels.length; // default slice radius

		const angleValues = {}; // keep ratios of all slices
		const anglesStarts = {}; // keep angles of all slices
		const outerRadiuses = {}; // keep outerRadiuses of each level
		const tree = {}; // keep slices data in tree

		const hidenLevels = [];

		// go through each level
		Object.entries(itemsByLevel).forEach(([levelNumber, levelData]) => {

			tree[levelNumber] = [];

			const { radius, labelAngle, onHoverEffect, onClickEffect, items } = levelData;

			const itemsByRoot = groupBy(items, 'root'); // groups items with same parent on this level
 
			effectHandler(onClickEffect, {
				expand: (effectObj) => {
					const { toLevel, showOuter } = effectObj;

					// option 2 : hide only levels that will be expanded on click
					if (showOuter) {
						for (let index = parseInt(levelNumber) + 1; index <= toLevel; index++) {
							// mark next levels as hidden so slice will no be drawn
							hidenLevels.push(index);
						}
					}

					// option 1 : hide all next levels
					else {
					const levelsNumbers = levels.map(level => levels.indexOf(level));
					hidenLevels.push(...levelsNumbers.slice(parseInt(levelNumber) + 1));
					}
				}
			});


			// on this level, create slices for every item (divided in groups with same root = sibling items => as many groups as there are items on previous level)
			Object.entries(itemsByRoot).forEach(([root, siblingsItems]) => {

				let angleShift = 0; // angle from item relative to its parent - used to calculate angleStart of next sibling

				// go through each item inside this group (all have same root)
				siblingsItems.forEach(item => {

					const { id, value, labelClass, size, color, gradient, onHoverCallback, onClickCallback } = item;
					// console.log(labelClass);

					// size of siblings
					const totalChildrenSize =  siblingsItems.map(itm => itm.size).reduce((accumulator, currentSize) => accumulator + currentSize, 0);

					// item ratio is proportion of item relative to its parent slice
					const itemRatio = size / totalChildrenSize;

					const parentAngleValue = levelNumber === '0' ? 360 : angleValues[root];
					if (typeof parentAngleValue === 'undefined') console.error(`could not find parentAngleValue for item ${id}`);
					const angleValue = parentAngleValue * itemRatio;
					angleValues[id] = angleValue; // save angleValue for current item

					const parentAngleStart = levelNumber === '0' ? 0 : anglesStarts[root];
					if (typeof parentAngleStart === 'undefined') console.error(`could not find parentAngleStart for item ${id}`);
					const angleStart = parentAngleStart + angleShift;
					anglesStarts[id] = angleStart; // save angleStart for current item

					angleShift += angleValue;


					const innerRadius = levelNumber === '0' ? minSize : outerRadiuses[levelNumber - 1];
					const outerRadius = innerRadius + (radius ? radius : defaultRadius);

					outerRadiuses[levelNumber] = outerRadius;


					const doughnutRadius = width / 2;
					const slice = new Slice(
						svgId,
						parseInt(levelNumber),
						size,
						angleStart,
						angleValue,
						innerRadius,
						outerRadius,
						doughnutRadius,
						color,
						value,
						labelAngle,
						labelClass,
						id,
						onHoverCallback,
						onHoverEffect,
						onClickCallback,
						onClickEffect,
						[] // will be populated on next level
						);
					const hidden = hidenLevels.includes(parseInt(levelNumber));
					slice.draw(hidden, { gradient });

					// update root children
					if (levelNumber !== '0') {
						const rootSlice = tree[levelNumber - 1].find(item => item.id === root);
						if (rootSlice) rootSlice.childrenSlices.push(slice);
						else console.error(`could not find root for item ${id}`);
					}
					// keep slice data in tree
					tree[levelNumber].push(slice);
				});
			});
		});
	}
}

export default Doughnut;

