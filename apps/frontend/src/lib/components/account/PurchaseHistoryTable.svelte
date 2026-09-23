<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Purchase } from '$lib/types/database';

	interface Props {
		purchases: Purchase[];
	}

	let { purchases }: Props = $props();

	function formatDate(iso?: string) {
		if (!iso) return 'N/A';
		try {
			return new Intl.DateTimeFormat('en-UK', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			}).format(new Date(iso));
		} catch {
			return iso;
		}
	}

	function formatCurrency(amount: number, currency = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(amount);
	}
</script>

<section class="space-y-4">
	<div class="flex items-end justify-between border-b pb-3">
		<div>
			<span class="text-[10px] tracking-widest text-surface-500 uppercase">Receipts & Orders</span>
			<h2 class="text-2xl font-bold tracking-tight uppercase">Purchase History</h2>
		</div>
		<span class="text-xs text-surface-500 uppercase">
			{purchases.length}
			{purchases.length === 1 ? 'transaction' : 'transactions'}
		</span>
	</div>

	{#if purchases.length > 0}
		<div
			class="overflow-x-auto border border-surface-300 bg-surface-50 dark:border-surface-700 dark:bg-surface-900"
		>
			<table class="w-full border-collapse text-left text-xs">
				<thead>
					<tr
						class="border-b border-surface-300 bg-surface-200/50 font-bold tracking-wider text-surface-600 uppercase dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
					>
						<th class="p-3">Date</th>
						<th class="p-3">Item Description</th>
						<th class="p-3">Category</th>
						<th class="p-3">Amount</th>
						<th class="p-3">Status</th>
						<th class="p-3 text-right">Reference</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-200 dark:divide-surface-800">
					{#each purchases as purchase (purchase.id)}
						<tr class="transition-colors hover:bg-surface-100/60 dark:hover:bg-surface-800/40">
							<td class="p-3 whitespace-nowrap text-surface-600 dark:text-surface-400">
								{formatDate(purchase.created)}
							</td>
							<td class="p-3 font-sans font-medium text-surface-900 dark:text-surface-100">
								<div class="flex items-center gap-2">
									<span>{purchase.item_name}</span>
									{#if purchase.type === 'issue' && purchase.item_id}
										<a
											href={resolve(
												`/issues/success?session_id=${purchase.stripe_payment_id || purchase.id}&issue_id=${purchase.item_id}`
											)}
											class="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-primary-600 underline hover:opacity-80 dark:text-primary-400 uppercase"
											title="Download PDF"
										>
											<span class="icon-[boxicons--file]"></span>
											<span>PDF</span>
										</a>
									{/if}
								</div>
							</td>
							<td class="p-3">
								<span
									class="bg-surface-200 px-2 py-0.5 text-[10px] font-bold text-surface-700 uppercase dark:bg-surface-800 dark:text-surface-300"
								>
									{purchase.type}
								</span>
							</td>
							<td class="p-3 font-bold text-surface-900 dark:text-surface-100">
								{formatCurrency(purchase.amount, purchase.currency || 'usd')}
							</td>
							<td class="p-3">
								{#if purchase.status === 'completed'}
									<span
										class="text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400"
									>
										● Paid
									</span>
								{:else}
									<span class="text-[10px] text-surface-500 uppercase">
										{purchase.status}
									</span>
								{/if}
							</td>
							<td class="max-w-28 truncate p-3 text-right text-[10px] text-surface-500">
								{purchase.stripe_payment_id || purchase.id.substring(0, 10)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div
			class="space-y-2 border border-dashed border-surface-300 bg-surface-50 p-8 text-center dark:border-surface-700 dark:bg-surface-900"
		>
			<span class="icon-[boxicons--receipt] mx-auto block text-3xl opacity-30"></span>
			<p class="text-sm font-bold tracking-tight uppercase">No Previous Purchases</p>
			<p class="mx-auto max-w-sm text-xs text-surface-500">
				When you purchase magazine issues, membership subscriptions, or screening tickets, your
				order history and receipts will be recorded here.
			</p>
		</div>
	{/if}
</section>
