import Doughnut from './Doughnut.js';
import items from '../data/data.json';

const levels = [{
		// level 0
		key: 'division',
		radius: 100,
		labelAngle: 0,
		labelClass: 'l0',
		color: '#FFFFFF',
		onClickEffect: [{ effect: 'expand', toLevel: 3, showOuter: false }],
	}, {
		// level 1
		key: 'scope',
		radius: 15,
		labelAngle: 'radial',
		labelClass: 'l1',
		color: '#E14B4B',
		gradient: true
	}, {
		// level 2
		key: 'category',
		radius: 90,
		labelAngle: 0,
		labelClass: 'l2',
		color: (item) => item.id === 'software' ? '#FAAF3B' : '#5EBDEE' // 'local business'
	}, {
		// level 3
		key: 'type',
		radius: 60,
		labelAngle: 'radial',
		labelClass: 'l3',
		color: (item) => item.id === 'product' ? '#F0471C' : '#1352A0', // service
		gradient: true,
		onClickEffect: [{ effect: 'expand', toLevel: 4, showOuter: false }],
	}, {
		// level 4
		key: 'name',
		size: 1, // size for each slice on level 4
		radius: 210,
		labelAngle: 0,
		labelClass: 'l4',
		tooltip: true,
		// onHoverCallback: (item) => { console.log(item.id) },
		onHoverEffect: ['shadow', 'darken', 'slide'],
		// onClickCallback: (item) => { console.log(item.root) },
		color: (item) => item.root === 'product' ? '#EB6B51' : '#5DBCEC', // service
		gradient: 'radial',
	}, /*{
		// level 5
		key: 'company'
	}*/
];


new Doughnut('charter-1', 'tooltips', levels, items);