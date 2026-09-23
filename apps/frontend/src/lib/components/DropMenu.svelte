<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { slide } from '$lib/assets/transitions/transitions';
	import { expoOut } from 'svelte/easing';

	interface Props {
		categories?: { label: string; path: string }[];
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

	const user = $derived(page.data.user);
	const isSubscribed = $derived(Boolean(user?.isSubscribed));

	const computedCategories = $derived.by(() => {
		if (categories && categories.length > 0) return categories;

		const links: { label: string; path: string }[] = [
			{ label: 'Issues', path: '/issues' },
			{ label: 'Archive', path: '/archive' },
			{ label: 'Screenings', path: '/screenings' },
		];

		// The subscribe page should only show up if you are not logged in or you are logged in but aren't subscribed

		if (user) {
			links.push({ label: 'Account', path: '/account' });
		}
		else {
			links.push({ label: 'Sign In', path: '/login' })
		}

		links.push({ label: 'About', path: '/about' });
		return links;
	});
</script>

{#if showing}
	<div
		in:whichSlide
		out:whichSlide
		class="drawer absolute top-full left-0 z-10 flex h-[calc(100dvh-100%)] w-full flex-col md:h-fit md:flex-row dark:bg-surface-50"
	>
		<div class="flex-9 flex flex-col justify-between bg-surface-950 text-xs md:h-fit md:flex-row dark:bg-surface-50">
			{#each computedCategories as item, i (item.path)}
				<a
					href={resolve(item.path as any)}
					id={i.toString()}
					onclick={() => (showing = false)}
					class="flex flex-1 items-center justify-center py-4 md:py-0  text-xl tracking-wider text-typo-base-dark uppercase md:text-sm dark:text-typo-base-light hover:opacity-70 transition-opacity"
				>
					{item.label}
				</a>
			{/each}
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
