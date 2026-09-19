function cubic_out(t) {
	const f = t - 1.0;
	return f * f * f + 1.0;
}

export function slide(node, { layered = false, delay = 0, duration = 400, easing = cubic_out, axis = 'y' } = {}) {
	const style = getComputedStyle(node);
	const is_border_box = style.boxSizing === "border-box";

	const opacity = +style.opacity;
	const primary_property = axis === 'y' ? 'height' : 'width';
	const primary_property_value = parseFloat(style[primary_property]);
	const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
	const capitalized_secondary_properties = secondary_properties.map(
		(e) => (`${e[0].toUpperCase()}${e.slice(1)}`)
	);
	const start_properties = [
		[`margin-${secondary_properties[0]}`, parseFloat(style[`margin${capitalized_secondary_properties[0]}`])],
		[`border-${secondary_properties[0]}-width`, parseFloat(style[`border${capitalized_secondary_properties[0]}Width`])],
		[`padding-${secondary_properties[0]}`, parseFloat(style[`padding${capitalized_secondary_properties[0]}`])],
	]
	const end_properties = [
		[`padding-${secondary_properties[1]}`, parseFloat(style[`padding${capitalized_secondary_properties[1]}`])],
		[`border-${secondary_properties[1]}-width`, parseFloat(style[`border${capitalized_secondary_properties[1]}Width`])],
		[`margin-${secondary_properties[1]}`, parseFloat(style[`margin${capitalized_secondary_properties[1]}`])],
	]
	const all_properties = [
		...start_properties,
		[primary_property, is_border_box && layered ? primary_property_value - [...start_properties, ...end_properties].reduce((acc, [property, value]) => acc + (property.startsWith("margin") ? 0 : value), 0) : primary_property_value],
		...end_properties,
	]
	const total = all_properties.reduce((acc, [, value]) => acc + value, 0)

	function css(t) {
		let css = 'overflow: hidden;' +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`min-${primary_property}: 0;`;
		if (layered) [css] = all_properties.reduce(reducer, [css, 0]);
		else css += all_properties.map(([property, value]) => `${property}: ${value * t}px;`).join("")
		return css

		function reducer([css, acc], [property, value]) {
			if (is_border_box && property === primary_property) return [
				`${css}${property}: ${Math.min(primary_property_value, Math.max(0, t - start_properties[0][1] / total) * total)}px;`,
				acc + value,
			]
			if (value == 0) return [css, acc];
			return [
				`${css}${property}: ${Math.min(value, Math.max(0, t - acc / total) * total)}px;`,
				acc + value
			]
		}
	}
	
	return {
		delay,
		duration,
		easing,
		css,
	};
}