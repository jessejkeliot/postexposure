<script lang="ts">
	export interface Tier {
		id: string;
		name: string;
		description: string;
		priceMonthly: number;
		priceAnnual: number;
		popular?: boolean;
		features: string[];
	}

	interface Props {
		tier: Tier;
		tierIndex: number;
		billing: 'monthly' | 'annual';
		loadingTier: string | null;
		onSubscribe: (tier: Tier) => void;
	}

	let { tier, tierIndex, billing, loadingTier, onSubscribe }: Props = $props();

	const price = $derived(billing === 'annual' ? tier.priceAnnual : tier.priceMonthly);
	const period = $derived(billing === 'annual' ? '/ year' : '/ month');
</script>

<div
	class="relative flex flex-col justify-between border {tier.popular
		? 'border-2 border-surface-950 shadow-lg dark:border-surface-50'
		: 'border-surface-300 dark:border-surface-700'} bg-surface-50 p-6 transition-all hover:border-surface-950 sm:p-8 dark:bg-surface-900 dark:hover:border-surface-100"
>
	{#if tier.popular}
		<div
			class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-surface-950 px-3 py-1 text-[10px] font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950"
		>
			Most Popular
		</div>
	{/if}

	<div>
		<!-- Tier Header -->
		<div class="border-b border-surface-200 pb-5 dark:border-surface-800">
			<span class="text-[10px] tracking-widest text-surface-500 uppercase">
				Tier // 0{tierIndex + 1}
			</span>
			<h2 class="mt-1 text-2xl font-bold tracking-tight uppercase">{tier.name}</h2>
			<p class="mt-2 min-h-8 text-xs text-surface-600 dark:text-surface-400">
				{tier.description}
			</p>
		</div>

		<!-- Price Display -->
		<div
			class="flex items-baseline gap-1 border-b border-surface-200 py-6 dark:border-surface-800"
		>
			<span class="text-4xl font-bold tracking-tight sm:text-5xl">${price}</span>
			<span class="text-xs text-surface-500 uppercase">{period}</span>
		</div>

		<!-- Feature List -->
		<ul class="space-y-3 py-6 text-xs">
			{#each tier.features as feature (feature)}
				<li class="flex items-start gap-2.5">
					<span
						class="icon-[boxicons--check] mt-0.5 shrink-0 text-base text-emerald-500"
					></span>
					<span class="leading-snug text-surface-700 dark:text-surface-300">{feature}</span>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Subscribe CTA Button -->
	<div class="border-t border-surface-200 pt-6 dark:border-surface-800">
		<button
			type="button"
			disabled={loadingTier !== null}
			onclick={() => onSubscribe(tier)}
			class="w-full py-3.5 {tier.popular
				? 'bg-surface-950 font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950'
				: 'btn preset-outlined font-bold tracking-widest uppercase'} flex items-center justify-center gap-2 text-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
		>
			{#if loadingTier === tier.id}
				<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
				<span>Connecting Stripe...</span>
			{:else}
				<span class="icon-[boxicons--credit-card]"></span>
				<span>Subscribe with Stripe</span>
			{/if}
		</button>

		<div
			class="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-surface-500 uppercase"
		>
			<span class="icon-[boxicons--shield-quarter]"></span>
			<span>Secure 256-bit encrypted checkout</span>
		</div>
	</div>
</div>
