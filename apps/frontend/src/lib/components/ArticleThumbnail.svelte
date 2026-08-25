<script lang="ts">
	import type { Article } from '$lib/types/database';
	import { getFileUrl } from '$lib/pocketbase/db';

	interface Props {
		article: Article;
		variant?: 'compact' | 'standard' | 'featured';
		showCover?: boolean;
		showDate?: boolean;
	}

	let { article, variant = 'standard', showCover = true, showDate = false }: Props = $props();

	const coverUrl = $derived.by(() => {
		if (!article.cover_image) return null;
		if (article.cover_image.startsWith('http://') || article.cover_image.startsWith('https://')) {
			return article.cover_image;
		}
		return getFileUrl(article, article.cover_image, { thumb: '600x400' });
	});

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
	class="group flex flex-col justify-between border-b border-zinc-200 pb-6 text-black {variant ===
	'featured'
		? 'md:grid md:grid-cols-2 md:gap-8 md:border-b-2'
		: ''}"
>
	<div>
		{#if showCover && coverUrl}
			<a
				href="/articles/{article.slug}"
				class="group relative mb-4 block aspect-16/10 min-w-28 overflow-hidden bg-zinc-100"
			>

				<img
					src={coverUrl}
					alt={article.title}
					class="h-full w-full object-cover p-4 transition duration-220 delay-0 group-hover:saturate-120 md:p-8"
					loading="lazy"
				/>
			</a>
		{/if}

		<div
			class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wider text-zinc-500 uppercase"
		>
			{#if categoryName}
				<span class="font-medium text-black">[{categoryName}]</span>
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
				<span class="border border-zinc-400 px-1 py-0.5 text-[10px] font-semibold text-zinc-700"
					>Subscriber</span
				>
			{/if}
		</div>

		<h2
			class="mt-2 font-serif leading-snug font-normal tracking-tight text-zinc-900 group-hover:underline {variant ===
			'featured'
				? 'text-2xl md:text-3xl'
				: variant === 'compact'
					? 'text-base font-medium'
					: 'text-xl'}"
		>
			<a href={`/articles/${article.slug}`}>
				{article.title}
			</a>
		</h2>

		{#if article.excerpt && variant !== 'compact' && variant !== 'standard'}
			<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">
				{article.excerpt}
			</p>
		{/if}
	</div>

	{#if authorName}
		<div class="mt-4 text-xs tracking-wide text-zinc-500">
			By <span class="font-medium text-zinc-900">{authorName}</span>
		</div>
	{/if}
</article>
