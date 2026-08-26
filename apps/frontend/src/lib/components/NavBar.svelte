<script lang="ts">
	import { resolve } from '$app/paths';
	import DropMenu from './DropMenu.svelte';
	let { children } = $props();

	let showing = $state(false);
</script>

<div class="min-h-screen w-full flex flex-col">
	<header class="sticky top-0 z-50 w-full">
		<nav class="navbar relative z-30 flex w-full flex-row items-center justify-between border-b-2 px-4 py-1 bg-surface-50 dark:bg-surface-950">
			<button
				type="button"
				class="btn btn-icon p-0.5"
				title="Menu"
				aria-label="Menu"
				onclick={() => (showing = !showing)}
			>
				<span class="icon-[boxicons--menu] btn-icon-xl"></span>
			</button>
			<a href={resolve("/")} data-sveltekit-preload-data="hover">
				<span class="font-bold tracking-wide font-stretch-110% xxs:text-2xl sm:text-3xl">
					POST EXPOSURE
				</span>
			</a>
			<button type="button" class="btn btn-icon p-0.5" title="Search" aria-label="Search">
				<span class="icon-[boxicons--search] btn-icon-xl"></span>
			</button>
		</nav>
		<DropMenu categories={["/essays", "/issues", "/archive", "/screenings"]} bind:showing />
	</header>

	<div class="h-full w-full flex-1 px-4 mb-4">
		{@render children()}
	</div>
</div>
