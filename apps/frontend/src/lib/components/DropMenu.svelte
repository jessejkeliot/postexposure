<script lang="ts">
	import { resolve} from '$app/paths';
	import { linear } from 'svelte/easing';
	import { slide } from 'svelte/transition';
    import type { RouteId } from './$types';
	interface Props {
		categories: RouteId[];
		showing: boolean;
	}
	let { categories, showing = $bindable(false) }: Props = $props();
</script>

{#if showing}
	<div
		transition:slide={{ duration: 150, easing: linear }}
		class="relative z-10 flex h-fit w-full flex-row justify-between bg-surface-950 px-4 xs:px-8 py-0 text-xs text-surface-contrast-light dark:bg-surface-50 dark:text-surface-950"
	>
		{#each categories as category, i (category)}
			<a href={resolve(category)} id={i.toString()} data-sveltekit-preload-data class="capitalize btn-sm"
				>{category.replace("/", "")}</a
			>
		{/each}
	</div>
{/if}
