<script lang="ts">
	interface Props {
		billing: 'monthly' | 'annual';
		onChange: (cycle: 'monthly' | 'annual') => void;
	}

	let { billing, onChange }: Props = $props();
</script>

<div class="flex items-center justify-center gap-3 pt-4">
	<div
		class="inline-flex border border-surface-300 bg-surface-100 p-1 text-xs dark:border-surface-700 dark:bg-surface-800"
	>
		<button
			type="button"
			onclick={() => onChange('monthly')}
			class="px-4 py-2 font-bold tracking-wider uppercase transition-colors cursor-pointer {billing ===
			'monthly'
				? 'bg-surface-950 text-surface-50 shadow-sm dark:bg-surface-50 dark:text-surface-950'
				: 'text-surface-600 hover:opacity-80 dark:text-surface-400'}"
		>
			Monthly Billing
		</button>
		<button
			type="button"
			onclick={() => onChange('annual')}
			class="flex items-center gap-1.5 px-4 py-2 font-bold tracking-wider uppercase transition-colors cursor-pointer {billing ===
			'annual'
				? 'bg-surface-950 text-surface-50 shadow-sm dark:bg-surface-50 dark:text-surface-950'
				: 'text-surface-600 hover:opacity-80 dark:text-surface-400'}"
		>
			<span>Annual Billing</span>
			<span
				class="py-0.2 rounded-sm bg-emerald-500 px-1.5 text-[9px] font-bold text-white uppercase"
			>
				Save 20%
			</span>
		</button>
	</div>
</div>
