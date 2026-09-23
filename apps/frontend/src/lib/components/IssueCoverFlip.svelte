<script lang="ts">
	import type { Issue } from '$lib/types/database';
	import { getIssueCoverUrl } from '$lib/pocketbase/db';
	import GrainOverlay from './image-effects/GrainOverlay.svelte';

	interface Props {
		issue: Issue;
		variant?: 'hero' | 'standard' | 'compact';
		showFlipHint?: boolean;
	}

	let { issue, variant = 'standard', showFlipHint = false }: Props = $props();

	let isFlipped = $state(false);

	const frontCoverUrl = $derived(
		getIssueCoverUrl(issue, 'front', { thumb: variant === 'hero' ? '800x1100' : '500x700' })
	);
	const backCoverUrl = $derived(
		getIssueCoverUrl(issue, 'back', { thumb: variant === 'hero' ? '800x1100' : '500x700' })
	);

	function toggleFlip() {
		isFlipped = !isFlipped;
	}
</script>

<div
	class="magazine-perspective group relative w-full select-none {variant === 'hero'
		? 'mx-auto max-w-md lg:max-w-none'
		: ''}"
	onclick={toggleFlip}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleFlip();
		}
	}}
	role="button"
	tabindex="0"
	aria-label={`Magazine cover for ${issue.title}. Click or hover to flip.`}
>
	<!-- 3D Card Flipper Container -->
	<div
		class="magazine-card relative aspect-3/4 w-full shadow-2xl rounded-sm transition-transform duration-700 ease-out {isFlipped
			? 'is-flipped'
			: ''}"
	>
		<!-- Front Cover -->
		<div
			class="magazine-face magazine-front absolute inset-0 overflow-hidden rounded-sm bg-surface-900 text-surface-50"
		>
			{#if frontCoverUrl}
				<img
					src={frontCoverUrl}
					alt={`${issue.title} front cover`}
					class="h-full w-full object-cover transition duration-300 group-hover:scale-102"
					loading={variant === 'hero' ? 'eager' : 'lazy'}
				/>
			{:else}
				<div class="flex h-full w-full flex-col items-center justify-center p-6 text-center">
					<span class="mb-2 icon-[boxicons--book-open] text-4xl opacity-50"></span>
					<span class="text-sm font-bold tracking-widest uppercase">{issue.title}</span>
					<span class="mt-1 text-xs opacity-60">Front Cover</span>
				</div>
			{/if}

			<!-- Subtle Spine Light Reflection -->
			<div
				class="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 via-white/10 to-transparent"
			></div>
		</div>

		<!-- Back Cover (Flipped 180deg) -->
		<div
			class="magazine-face magazine-back absolute inset-0 overflow-hidden rounded-sm bg-surface-950 text-surface-50"
		>
			{#if backCoverUrl}
				<img
					src={backCoverUrl}
					alt={`${issue.title} back cover`}
					class="h-full w-full object-cover transition duration-300 group-hover:scale-102"
					loading="eager"
				/>
			{:else}
				<div
					class="flex h-full w-full flex-col justify-between bg-surface-950 p-6 text-surface-100"
				>
					<div class="flex items-center justify-between border-b border-surface-800 pb-3">
						<span class=" text-[10px] tracking-widest uppercase opacity-70"
							>Post Exposure Magazine</span
						>
						<span class="text-[10px] font-bold tracking-wider uppercase opacity-70">Back Cover</span
						>
					</div>
					<div class="my-auto space-y-3 text-center">
						<span class="mx-auto icon-[boxicons--barcode] block text-5xl opacity-80"></span>
						<p class=" text-xs tracking-widest uppercase opacity-80">{issue.title}</p>
						{#if issue.description}
							<p class="line-clamp-4 px-2 text-[11px] leading-relaxed font-light opacity-70">
								{issue.description}
							</p>
						{/if}
					</div>
					<div
						class="flex items-center justify-between border-t border-surface-800 pt-3  text-[10px] opacity-60"
					>
						<span>PRINT EDITION</span>
						<span>£{issue.price.toFixed(2)}</span>
					</div>
				</div>
			{/if}

			<!-- Subtle Spine Light Reflection (Mirrored for Back) -->
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/40 via-white/10 to-transparent"
			></div>
		</div>
	</div>

	{#if showFlipHint}
		<div
			class="mt-2 flex items-center justify-center gap-1.5 text-[10px] tracking-wider text-surface-600-400 uppercase opacity-70 transition-opacity group-hover:opacity-100"
		>
			<span class="text-xs icon-[boxicons--redo]"></span>
			<span>Hover or tap to flip</span>
		</div>
	{/if}
</div>

<style>
	.magazine-perspective {
		perspective: 1200px;
	}

	.magazine-card {
		transform-style: preserve-3d;
	}

	/* Flip on hover for mouse devices */
	@media (hover: hover) {
		.group:hover .magazine-card {
			transition-delay: 120ms;
			transform: rotateY(180deg);
		}
	}

	/* Programmatic or tap flip class */
	.magazine-card.is-flipped {
		transform: rotateY(180deg);
	}

	.magazine-face {
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.magazine-back {
		transform: rotateY(180deg);
	}
</style>
