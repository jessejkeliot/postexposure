<script lang="ts">
	import { resolve } from '$app/paths';
	import { linear } from 'svelte/easing';
	import { slide } from '$lib/assets/transitions/transitions';

	interface Props {
		categories: string[];
		showing: boolean;
	}
	let { categories, showing = $bindable(false) }: Props = $props();
	function whichSlide(node: Element) {
		const dir = getCssVar('--dir', node);
		const params = { duration: 150, easing: linear, axis: 'y', layered: true };
		if (dir==="right"){
			params.axis = 'x';
			params.duration = 220;
		}
		return slide(node, params);
	}
	function getCssVar(cssvar: string, node: Element){
		return getComputedStyle(node).getPropertyValue(cssvar).trim();
	}
</script>

{#if showing}
	<div
		in:whichSlide
		out:whichSlide
		class="drawer absolute top-full left-0 z-10 flex w-full flex-col h-[calc(100dvh-100%)] justify-between bg-surface-950 py-0 text-xs md:flex-row md:h-fit dark:bg-surface-50"
	>
		{#each categories as category, i (category)}
			<a
				href={resolve(category as any)}
				id={i.toString()}
				onclick={() => (showing = false)}
				class="flex-1 flex justify-center items-center text-2xl md:text-sm text-typo-base-dark capitalize hover:bg-primary-700-300 dark:text-typo-base-light"
				>{category.replace('/', '')}</a
			>
		{/each}
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
