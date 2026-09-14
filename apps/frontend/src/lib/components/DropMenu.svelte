<script lang="ts">
	import { resolve } from '$app/paths';
	import { linear } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	interface Props {
		categories: string[];
		showing: boolean;
	}
	let { categories, showing = $bindable(false) }: Props = $props();
</script>

{#if showing}
	<div
		transition:slide={{ duration: 150, easing: linear }}
		class="absolute z-10 flex h-fit w-full flex-row justify-between bg-surface-950 py-0 text-xs dark:bg-surface-50"
	>
		{#each categories as category, i (category)}
			<a href={resolve(category as any)} id={i.toString()} onclick={()=> (showing = false)} class="capitalize flex-1 text-center hover:bg-primary-700-300 text-typo-base-dark dark:text-typo-base-light"
				>{category.replace("/", "")}</a
			>
		{/each}
	</div>
{/if}