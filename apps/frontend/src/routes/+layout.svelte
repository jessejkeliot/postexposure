<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import favicon from '$lib/assets/favicon.svg';
	import NavBar from '$lib/components/NavBar.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<main class="layout bg-white text-black">
	<NavBar>
		{@render children()}
	</NavBar>
</main>