<script lang="ts">
	import { resolve } from '$app/paths';
	import DropMenu from './DropMenu.svelte';
	let { children } = $props();

	let showing = $state(false);

    function handleScroll(event: WheelEvent): void {
        if (event.deltaY > 0) showing=false;
    }
</script>

<div class="min-h-screen w-full flex flex-col">
	<header class="sticky top-0 z-50 w-full">
		<nav class="navbar relative z-30 flex w-full flex-row items-center justify-between border-b px-4 py-1 bg-surface-50 dark:bg-surface-950">
			<button
				type="button"
				class="btn btn-icon p-0.5"
				title="Menu"
				aria-label="Menu"
				onclick={() => (showing = !showing)}
			>
                {#if showing}
				<span class="icon-[boxicons--x] btn-icon-xl"></span>
                {:else}
                <!-- else content here -->
				<span class="icon-[boxicons--menu] btn-icon-xl"></span>
                {/if}
			</button>
			<a href={resolve("/")} data-sveltekit-preload-data="hover" onclick={()=> (showing = false)}>
				<span class="font-bold h1 tracking-wide font-stretch-110% text-xl sm:text-3xl">
					POST EXPOSURE
				</span>
			</a>
			<button type="button" class="btn btn-icon p-0.5" title="Search" aria-label="Search">
				<span class="icon-[boxicons--search] btn-icon-xl"></span>
			</button>
		</nav>
		<DropMenu categories={["/issues", "/archive", "/screenings", "/tickets", "/subscribe", "/about",]} bind:showing />
	</header>
	<div class="h-full w-full flex-1 px-4 mb-4">
		{@render children()}
	</div>
</div>
<svelte:window onwheel={handleScroll}/>
