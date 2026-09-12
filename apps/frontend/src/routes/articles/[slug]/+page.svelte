<script lang="ts">
	import type { PageProps } from './$types';
	import ArticleThumbnail from '$lib/components/ArticleThumbnail.svelte';
	import { getArticleCoverUrl } from '$lib/pocketbase/db';

	let { data }: PageProps = $props();

	const coverUrl = $derived(getArticleCoverUrl(data.article, { thumb: '1200x800' }));

	const formattedDate = $derived(
		data.article.published_at
			? new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}).format(new Date(data.article.published_at))
			: null
	);

	const categoryName = $derived(data.article.expand?.category?.name);
	const authorName = $derived(data.article.expand?.author?.name);
	const authorBio = $derived(data.article.expand?.author?.bio);
</script>

<svelte:head>
	<title>{data.article.title} | Post Exposure</title>
	{#if data.article.excerpt}
		<meta name="description" content={data.article.excerpt} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-4xl py-6 sm:py-10">
	<!-- Article Header -->
	<header class="mb-8 border-b border-surface-200-800 pb-8">
		<div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wider uppercase opacity-75">
			{#if categoryName}
				<span class="font-medium text-primary-500">[{categoryName}]</span>
			{/if}
			{#if categoryName && formattedDate}
				<span>•</span>
			{/if}
			{#if formattedDate}
				<time datetime={data.article.published_at}>{formattedDate}</time>
			{/if}
			{#if data.article.is_paywalled}
				<span class="border border-surface-400-600 px-1.5 py-0.5 text-[10px] font-semibold">
					Subscriber
				</span>
			{/if}
		</div>

		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
			{data.article.title}
		</h1>

		{#if data.article.excerpt}
			<p class="mt-4 text-lg font-light leading-relaxed opacity-80 sm:text-xl">
				{data.article.excerpt}
			</p>
		{/if}

		{#if authorName}
			<div class="mt-6 flex items-center gap-3">
				<div>
					<p class="text-sm font-medium">By {authorName}</p>
					{#if authorBio}
						<p class="text-xs opacity-60">{authorBio}</p>
					{/if}
				</div>
			</div>
		{/if}
	</header>

	<!-- Cover Image -->
	{#if coverUrl}
		<figure class="mb-10 overflow-hidden bg-surface-100-900">
			<img
				src={coverUrl}
				alt={data.article.title}
				class="h-auto w-full object-cover max-h-[500px]"
			/>
		</figure>
	{/if}

	<!-- Article Body -->
	<div class="prose prose-neutral dark:prose-invert max-w-none prose-lg leading-relaxed">
		{#if data.article.content}
			{@html data.article.content}
		{/if}
	</div>

	<!-- More Articles Section -->
	{#if data.moreArticles.length > 0}
		<section class="mt-16 border-t border-surface-200-800 pt-12">
			<h2 class="mb-8 text-2xl font-bold tracking-tight">More Articles</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				{#each data.moreArticles as article (article.id)}
					<ArticleThumbnail {article} variant="standard" showCover={true} />
				{/each}
			</div>
		</section>
	{/if}
</div>
