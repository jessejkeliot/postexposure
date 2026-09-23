<script lang="ts">
	interface Props {
		quantity: number;
		basePrice: number;
		totalPrice: string;
		savings: string;
		isSubscribed: boolean;
	}

	let { quantity, basePrice, totalPrice, savings, isSubscribed }: Props = $props();
</script>

<div class="space-y-2 border-t-2 border-surface-950 pt-4 text-sm dark:border-surface-50">
	<div class="flex justify-between">
		<span>{quantity}x Admission Ticket(s)</span>
		<span>£{(basePrice * quantity).toFixed(2)}</span>
	</div>
	{#if isSubscribed}
		<div class="flex justify-between text-emerald-500">
			<span>Member Discount (20%)</span>
			<span>-£{savings}</span>
		</div>
	{/if}
	<div
		class="flex justify-between border-t border-surface-950 pt-2 text-lg font-bold dark:border-surface-50"
	>
		<span>Total Amount</span>
		<span>£{totalPrice}</span>
	</div>
</div>
