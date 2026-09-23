<!-- Adapted from https://codepen.io/abjt14/pen/PoRwxjo -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Intensity = 'fine' | 'medium' | 'coarse';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		intensity?: Intensity;
		animated?: boolean;
		children?: Snippet;
		class?: string;
		overlayClass?: string;
	}

	let {
		intensity = 'fine',
		animated = true,
		children,
		class: className = '',
		overlayClass = '',
		...restProps
	}: Props = $props();

	// Maps intensity to the corresponding SVG filter ID
	const filterId = $derived(`ifx-grain-${intensity}`);
</script>

<!-- Hidden SVG filter definition -->
<svg aria-hidden="true" focusable="false" class="absolute h-0 w-0 overflow-hidden">
	<filter
		id="ifx-grain-fine"
		x="0%"
		y="0%"
		width="100%"
		height="100%"
		color-interpolation-filters="sRGB"
	>
		<feTurbulence
			type="fractalNoise"
			baseFrequency="0.9"
			numOctaves="2"
			seed="7"
			stitchTiles="stitch"
			result="noise"
		/>
		<feColorMatrix
			in="noise"
			type="matrix"
			values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 0 0.10"
			result="grain"
		/>
		<feBlend in="SourceGraphic" in2="grain" mode="overlay" />
	</filter>

	<filter
		id="ifx-grain-medium"
		x="0%"
		y="0%"
		width="100%"
		height="100%"
		color-interpolation-filters="sRGB"
	>
		<feTurbulence
			type="fractalNoise"
			baseFrequency="0.6"
			numOctaves="2"
			seed="7"
			stitchTiles="stitch"
			result="noise"
		/>
		<feColorMatrix
			in="noise"
			type="matrix"
			values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 0 0.12"
			result="grain"
		/>
		<feBlend in="SourceGraphic" in2="grain" mode="overlay" />
	</filter>

	<filter
		id="ifx-grain-coarse"
		x="0%"
		y="0%"
		width="100%"
		height="100%"
		color-interpolation-filters="sRGB"
	>
		<feTurbulence
			type="fractalNoise"
			baseFrequency="0.35"
			numOctaves="3"
			seed="7"
			stitchTiles="stitch"
			result="noise"
		/>
		<feColorMatrix
			in="noise"
			type="matrix"
			values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 0 0.15"
			result="grain"
		/>
		<feBlend in="SourceGraphic" in2="grain" mode="overlay" />
	</filter>
</svg>

<!-- Container applying the selected filter to all child elements -->
<div class="relative h-full w-full overflow-hidden group {className}" {...restProps}>
	{#if children}
		<div class="noise-bg {animated ? "" : "paused"} absolute inset-0 pointer-events-none {overlayClass}" aria-hidden="true"></div>
		{@render children()}
	{/if}
</div>
<style>
	.noise-bg {
		z-index: 20;
		background: transparent
			url("$lib/assets/noise2.png") repeat 0 0;
		background-repeat: repeat;
		background-size: calc(1200px - 50cqw) auto;
		pointer-events: none;
		opacity: 0.7;
		animation: 300ms infinite noise linear;
		animation-play-state: running;
		/* animation-play-state: paused; */
	}
	.group:hover .noise-bg {
		/* animation-play-state: running; */
		opacity: 0.9;
	}
	.paused {
		animation-play-state: paused;
	}
	@media (prefers-reduced-motion: reduce) {
		.noise-bg {
			animation-play-state: paused;
			/* animation-play-state: paused; */
		}
	}

	@keyframes noise {
		0%,
		100% {
			background-position: 0 0;
		}
		10% {
			background-position: -5% -10%;
		}
		20% {
			background-position: -15% 5%;
		}
		30% {
			background-position: 7% -25%;
		}
		40% {
			background-position: 20% 25%;
		}
		50% {
			background-position: -25% 10%;
		}
		60% {
			background-position: 15% 5%;
		}
		70% {
			background-position: 0 15%;
		}
		80% {
			background-position: 25% 35%;
		}
		90% {
			background-position: -10% 10%;
		}
	}
</style>
