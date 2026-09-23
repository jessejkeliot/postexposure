<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DropMenu from './DropMenu.svelte';

	let { children } = $props();

	let showing = $state(false);

	function handleScroll(event: WheelEvent): void {
		if (event.deltaY > 0) showing = false;
	}

	const user = $derived(page.data.user);
	function checkIfMouseStillOver(){
		if(mouseOver === false){
			showing=false;
		}
	}
	let mouseOver = $state(false);
</script>

<div class="flex min-h-screen w-full flex-col">
	<header
		class="sticky top-0 z-50 w-full"
		onmouseleave={() => {
			mouseOver = false;
			setTimeout(checkIfMouseStillOver, 350)
		}}
		onmouseenter={() => {showing = true; mouseOver=true;}}
		role="directory"
	>
		<nav
			class="navbar relative z-30 flex w-full flex-row items-center justify-between border-b bg-surface-50 px-4 py-1.5 dark:bg-surface-950"
		>
			<div class="flex items-center">
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
						<span class="icon-[boxicons--menu] btn-icon-xl"></span>
					{/if}
				</button>
			</div>

			<a href={resolve('/')} data-sveltekit-preload-data="hover" onclick={() => (showing = false)}>
				<span class="h1 text-xl font-bold tracking-wide font-stretch-110% sm:text-3xl">
					POST EXPOSURE
				</span>
			</a>

			<div class="flex items-center">
				<a
					href={resolve('/tickets')}
					class="btn btn-icon p-0.5"
					title="Tickets"
					aria-label="Tickets"
					data-sveltekit-preload-data="hover"
				>
					<span class="icon-[boxicons--ticket] btn-icon-xl"></span>
				</a>
			</div>
		</nav>
		<DropMenu bind:showing />
	</header>
	<div class="mb-4 h-full w-full flex-1 px-4">
		{@render children()}
	</div>
</div>
<svelte:window onwheel={handleScroll} />
