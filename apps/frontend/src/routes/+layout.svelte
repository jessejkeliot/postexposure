<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children}: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<main>
	{@render children()}
</main>