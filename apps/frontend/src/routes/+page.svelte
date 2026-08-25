<script lang="ts">
	import type { PageProps } from './$types';
	import ArticleThumbnail from '$lib/components/ArticleThumbnail.svelte';

	let { data }: PageProps = $props();
</script>

<div class="space-y-8">
	<section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each data.articles as article (article.id)}
			<ArticleThumbnail {article} />
		{:else}
			<p class="col-span-full py-12 text-center text-sm text-zinc-500">
				No articles found.
			</p>
		{/each}
	</section>
</div>
