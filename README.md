charter

# description

`charter` is a JS module to draw interactive charts.

# use

1. provide flat data, ex in JSON :

```json
[{
		"name": "shoes & apparel",
		"description": "shoes & apparel",
		"type": "product",
		"company": "mitsubishi",
		"category": "software",
		"scope": "business to customer",
		"division": "core business"
	}, {
		"name": "automotive",
		"description": "automotive",
		"type": "product",
		"company": "mitsubishi",
		"category": "software",
		"scope": "business to customer",
		"division": "core business"
	}, {
		"name": "smartphone & accessories",
		"description": "smartphone & accessories",
		"type": "product",
		"company": "mitsubishi",
		"category": "software",
		"scope": "business to customer",
		"division": "core business"
	},
	...
]
```

2. define level

```js
[{
		name: 'category',
		radius: 90,
		labelAngle: 0,
		labelClass: 'l2',
		color: (item) => item.id === 'software' ? '#FAAF3B' : '#5EBDEE'
	},
	...
]
```

3. create desired chart

```html
<svg id="chart-1"></svg>
```

```js
new Doughnut('charter', levels, items);
```

# levels properties

- name: item key to look for label value. `string`
- radius: "height" of the layer. `number`
- labelAngle: angle of the label. `number` (0-360) | 'radial'
- size* : size of each slice. if not provided value for each slice will be computed using children sizes (recursively). `number`
- labelClass*: class applied to slice label. `string`
- color*: slice background color. `string` (CSS color)
- gradient*: slice background gradient. `boolean` | 'radial'
- onHoverCallback: `function`
- onHoverEffect: `[string]` valid string values => 'darken', 'shadow', 'slide', 'tooltip'
- onClickCallback: `function`
- onClickEffect: `[string|object]` object are use to pass options (similar to webpack config). valid string values => 'expand'. object example : { effect: 'expand', toLevel: 3 }

each property with an asterix can be applied on slice basis (as opposed to level basis).
To do so pass a function taking `item` as argument and returning correct type.

# item properties

- value: value corresponding to the key provided for level
- id: unique identifier (based on value)
- root: parent item id
- all other keys in provided data
