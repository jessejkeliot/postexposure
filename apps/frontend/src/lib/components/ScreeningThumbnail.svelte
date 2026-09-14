<script lang="ts">
	import type { Screening } from '$lib/types/database';
	import { getFilmCoverUrl, getRemainingTickets, isScreeningSoldOut } from '$lib/pocketbase/db';
	import { Temporal } from '@js-temporal/polyfill';

	interface Props {
		screening: Screening;
		variant?: 'compact' | 'standard' | 'featured';
		showDate?: boolean;
	}

	let { screening, variant = 'standard', showDate = true }: Props = $props();

	const tz = Temporal.Now.timeZoneId();

	const film = $derived(screening.expand?.film);
	const filmTitle = $derived(film?.title ?? 'Film Screening');
	const director = $derived(film?.director);
	const filmDescription = $derived(film?.description);
	const coverUrl = $derived(getFilmCoverUrl(film, { thumb: '600x400' }));
	const coverCaption = $derived(film?.expand?.cover_image?.caption || filmTitle);

	const releaseYear = $derived.by(() => {
		if (!film?.release_date) return null;
		try {
			return Temporal.Instant.from(film.release_date).toZonedDateTimeISO(tz).year;
		} catch {
			return new Date(film.release_date).getFullYear();
		}
	});

	const formattedDate = $derived.by(() => {
		try {
			const instant = Temporal.Instant.from(screening.showing_date);
			const zdt = instant.toZonedDateTimeISO(tz);
			return new Intl.DateTimeFormat('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}).format(new Date(zdt.epochMilliseconds));
		} catch {
			return new Intl.DateTimeFormat('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}).format(new Date(screening.showing_date));
		}
	});

	const formattedTime = $derived.by(() => {
		try {
			const instant = Temporal.Instant.from(screening.showing_time);
			const zdt = instant.toZonedDateTimeISO(tz);
			return zdt.toPlainTime().toString({ smallestUnit: 'minute' });
		} catch {
			return new Date(screening.showing_time).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	});

	const soldOut = $derived(isScreeningSoldOut(screening));
	const remainingTickets = $derived(getRemainingTickets(screening));
</script>

<article
	class="group flex flex-col justify-between border-b xl:border-b-0 pb-6 border-surface-200-800 {variant ===
	'featured'
		? 'md:grid md:grid-cols-2 md:gap-8 md:border-b-2'
		: ''}"
>
	<div class="min-w-28 flex flex-col h-full justify-between">
		<div>
			<!-- Film Poster Card / Visual Placeholder -->
			<div
				class="group relative mb-4 block aspect-16/10 min-w-28 overflow-hidden border border-surface-200-800 bg-linear-to-br from-surface-100-900 via-surface-300-700 to-surface-100-900 transition duration-200"
			>
				{#if coverUrl}
					<img
						src={coverUrl}
						alt={coverCaption}
						class="h-full w-full object-cover lg:brightness-90 transition duration-220 delay-0 lg:group-hover:saturate-120 lg:group-hover:brightness-100"
						loading="lazy"
					/>
				{:else}
					<div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
						<span class="icon-[boxicons--film] text-2xl sm:text-4xl mb-2 opacity-50 group-hover:scale-110 transition-transform"></span>
					</div>
				{/if}

				{#if soldOut}
					<div class="absolute top-2 right-2 bg-error-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
						Sold Out
					</div>
				{:else if screening.total_tickets}
					<div class="absolute top-2 right-2 bg-surface-950/80 text-surface-50 dark:bg-surface-50/80 dark:text-surface-950 px-2 py-0.5 text-[10px] font-semibold tracking-wider backdrop-blur-xs">
						{remainingTickets} tickets left
					</div>
				{/if}
			</div>

			<!-- Meta: Category, Date, Time, Status -->
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-wider uppercase">
				<!-- <span class="font-medium text-primary-600 dark:text-primary-400">[Screening]</span> -->
				{#if showDate && formattedDate}
					<span class="opacity-50">•</span>
					<time datetime={screening.showing_date} class="font-medium">
						{formattedDate}
					</time>
					<span class="opacity-50">at</span>
					<span class="font-bold underline decoration-primary-500/50">{formattedTime}</span>
				{/if}
			</div>

			<!-- Title -->
			<h2
				class="mt-2 leading-snug font-bold tracking-wider group-hover:underline text-xl xl:text-base"
			>
				{filmTitle}
			</h2>
			{#if director}
				<div>
					Directed by {director}, {releaseYear}
				</div>
			{/if}

			<!-- Excerpt / Film Description -->
			<!-- {#if filmDescription && variant !== 'compact'}
				<p class="mt-2 line-clamp-3 text-sm leading-relaxed opacity-80">
					{filmDescription}
				</p>
			{/if} -->
		</div>
	</div>
</article>
