<script lang="ts">
	import { resolve } from '$app/paths';
	import { bounceIn, cubicIn, cubicOut, expoOut, linear } from 'svelte/easing';
	import { slide } from '$lib/assets/transitions/transitions';

	interface Props {
		categories: string[];
		showing: boolean;
	}
	let { categories, showing = $bindable(false) }: Props = $props();
	function whichSlide(node: Element) {
		const dir = getCssVar('--dir', node);
		const params = { duration: 200, easing: expoOut, axis: 'y', layered: true };
		if (dir === 'right') {
			params.axis = 'x';
			params.duration = 220;
		}
		return slide(node, params);
	}
	function getCssVar(cssvar: string, node: Element) {
		return getComputedStyle(node).getPropertyValue(cssvar).trim();
	}
</script>

{#if showing}
	<div
		in:whichSlide
		out:whichSlide
		class="drawer absolute top-full left-0 z-10 flex h-[calc(100dvh-100%)] w-full flex-col md:h-fit md:flex-row dark:bg-surface-50"
	>
		<div class="flex-9 flex flex-col justify-between bg-surface-950 text-xs md:h-fit md:flex-row dark:bg-surface-50">
		{#each categories as category, i (category)}
			<a
				href={resolve(category as any)}
				id={i.toString()}
				onclick={() => (showing = false)}
				class="flex flex-1 items-center justify-center py-0 h2 text-2xl text-typo-base-dark capitalize md:text-sm dark:text-typo-base-light"
				>{category.replace('/', '')}</a
			>
		{/each}
		</div>
		<div class="w-full flex flex-row justify-around md:justify-between py-8 gap-4 items-center bg-surface-950 text-2xl md:py-0 md:px-4 md:text-base md:flex-row md:w-fit">
			<a href={resolve("/login")} aria-label="login" class="flex items-center">
				<span class="icon-[boxicons--user-square-filled] btn-icon-xl text-typo-base-dark"></span>
			</a>
			<a href={resolve("/tickets")} aria-label="tickets" class="flex items-center">
				<span class="icon-[boxicons--tickets] md:icon-[boxicons--ticket-filled] btn-icon-xl text-typo-base-dark"></span>
			</a>
		</div>
	</div>
{/if}

<style>
	.drawer {
		--dir: right;
	}
	@media (min-width: 48rem) {
		.drawer {
			--dir: top;
		}
	}
</style>
