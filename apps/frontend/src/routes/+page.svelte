<script lang="ts">
	import type { PageProps } from './$types';
	import ArticleThumbnail from '$lib/components/ArticleThumbnail.svelte';
	import CompactCalender from '$lib/components/CompactCalender.svelte';
	import SeasonBanner from '$lib/components/SeasonBanner.svelte';

	let { data }: PageProps = $props();
</script>

<div class="space-y-8">
	<section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" id="featuredarticles" data-prefers-theme="dark">
		{#each data.articles as article (article.id)}
			<ArticleThumbnail {article} />
		{:else}
			<p class="col-span-full py-12 text-center text-sm">
				No articles found.
			</p>
		{/each}
	</section>
    <SeasonBanner/>
    <section>  
        <CompactCalender screenings={data.screenings}></CompactCalender>
    </section>
    <section class="w-full h-60"></section>
</div>
