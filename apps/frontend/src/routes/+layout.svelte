<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import PostExposure from '$lib/assets/PostExposure.svg';
	import NavBar from '$lib/components/NavBar.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={PostExposure} /></svelte:head>
<main class="layout min-h-screen">
	<NavBar>
		{@render children()}
	</NavBar>
</main>