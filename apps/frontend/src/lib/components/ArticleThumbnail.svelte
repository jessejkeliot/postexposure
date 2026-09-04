<script lang="ts">
	import type { Article } from '$lib/types/database';
	import { getArticleCoverUrl } from '$lib/pocketbase/db';
	import { resolve } from '$app/paths';

	//need to add only preloading when subscriber content when 

	interface Props {
		article: Article;
		variant?: 'compact' | 'standard' | 'featured';
		showCover?: boolean;
		showDate?: boolean;
	}

	let { article, variant = 'standard', showCover = true, showDate = false }: Props = $props();

	const coverUrl = $derived(getArticleCoverUrl(article, { thumb: '600x400' }));

	const formattedDate = $derived(
		article.published_at
			? new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				}).format(new Date(article.published_at))
			: null
	);

	const categoryName = $derived(article.expand?.category?.name);
	const authorName = $derived(article.expand?.author?.name);
</script>

<article
	class="group flex flex-col justify-between border-b pb-6 {variant ===
	'featured'
		? 'md:grid md:grid-cols-2 md:gap-8 md:border-b-2'
		: ''}"
>
	<div class="min-w-28">
		{#if showCover && coverUrl}
			<a
				href={resolve(`/articles/${article.slug}`)} data-sveltekit-preload-data
				class="group relative mb-4 block aspect-16/10 min-w-28 overflow-hidden"
			>

				<img
					src={coverUrl}
					alt={article.title}
					class="h-full w-full object-cover p-4 lg:brightness-90 transition duration-220 delay-0 lg:group-hover:saturate-120 lg:group-hover:brightness-100 md:p-2"
					loading="lazy"
				/>
			</a>
		{/if}

		<div
			class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wider uppercase"
		>
			{#if categoryName}
				<span class="font-medium ">[{categoryName}]</span>
			{/if}
			{#if showDate}
				{#if categoryName && formattedDate}
					<span>•</span>
				{/if}
				{#if formattedDate}
					<time datetime={article.published_at}>{formattedDate}</time>
				{/if}
			{/if}
			{#if article.is_paywalled}
				<span class="border border-zinc-400 px-1 py-0.5 text-[10px] font-semibold "
					>Subscriber</span
				>
			{/if}
		</div>

		<h2
			class="mt-2 leading-snug font-bold tracking-wider  group-hover:underline {variant ===
			'featured'
				? 'text-2xl md:text-3xl'
				: variant === 'compact'
					? 'text-base font-medium'
					: 'text-xl'}"
		>
			<a href={resolve(`/articles/${article.slug}`)} data-sveltekit-preload-data>
				{article.title}
			</a>
		</h2>

		{#if article.excerpt && variant !== 'compact' && variant !== 'standard'}
			<p class="mt-2 line-clamp-3 text-sm leading-relaxed">
				{article.excerpt}
			</p>
		{/if}
	</div>

	{#if authorName}
		<div class="mt-4 text-xs tracking-wide ">
			By <span class="font-medium ">{authorName}</span>
		</div>
	{/if}
</article>
