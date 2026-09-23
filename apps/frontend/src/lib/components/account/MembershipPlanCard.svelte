<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { User } from '$lib/types/database';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();

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
</script>

<div
	class="flex flex-col justify-between space-y-6 border border-surface-300 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900"
>
	<div>
		<div class="flex items-center justify-between">
			<div>
				<span class="text-[10px] tracking-widest text-surface-500 uppercase">Subscription</span>
				<h2 class="mt-1 text-xl font-bold tracking-tight uppercase">Membership Plan</h2>
			</div>
			{#if user?.isSubscribed}
				<span
					class="border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400"
				>
					Active Member
				</span>
			{:else}
				<span
					class="bg-surface-200 px-3 py-1 text-xs font-bold tracking-widest text-surface-600 uppercase dark:bg-surface-800 dark:text-surface-400"
				>
					Standard Reader
				</span>
			{/if}
		</div>

		{#if user?.isSubscribed}
			<div class="mt-6 space-y-3 border border-emerald-500/30 bg-emerald-500/5 p-4">
				<div class="flex items-baseline justify-between">
					<div>
						<span class="text-[10px] text-surface-500 uppercase">Current Tier</span>
						<h3
							class="text-2xl font-bold tracking-tight text-emerald-600 uppercase dark:text-emerald-400"
						>
							{user.subscriptionTier || 'Supporter Membership'}
						</h3>
					</div>
					{#if user.subscriptionExpiresAt}
						<div class="text-right">
							<span class="text-[10px] text-surface-500 uppercase">Expires / Renews</span>
							<p class="text-xs font-bold">{formatDate(user.subscriptionExpiresAt)}</p>
						</div>
					{/if}
				</div>

				<ul class="space-y-1.5 border-t border-emerald-500/20 pt-2 text-xs">
					<li class="flex items-center gap-2">
						<span class="icon-[boxicons--check] text-emerald-500"></span>
						Full digital access to all Post Exposure Magazine issues & archive
					</li>
					<li class="flex items-center gap-2">
						<span class="icon-[boxicons--check] text-emerald-500"></span>
						Priority admission and special rates for repertory cinema screenings
					</li>
					<li class="flex items-center gap-2">
						<span class="icon-[boxicons--check] text-emerald-500"></span>
						Invitations to curator Q&As and filmmaker discussions
					</li>
				</ul>
			</div>
		{:else}
			<div
				class="mt-6 space-y-3 border border-dashed border-surface-300 bg-surface-100/50 p-4 dark:border-surface-700 dark:bg-surface-800/40"
			>
				<h3 class="text-lg font-bold tracking-tight uppercase">
					Support Independent Film Journalism
				</h3>
				<p class="text-xs leading-relaxed text-surface-600 dark:text-surface-400">
					Upgrade to a Post Exposure membership to unlock complete digital magazine archives,
					screening discounts, and exclusive events.
				</p>
				<div class="pt-2">
					<a
						href={resolve('/subscribe')}
						class="btn inline-flex items-center gap-2 bg-surface-950 px-6 py-2.5 text-xs font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950"
					>
						<span>Explore Membership Plans</span>
						<span class="icon-[boxicons--arrow-to-right]"></span>
					</a>
				</div>
			</div>
		{/if}
	</div>

	{#if user?.isSubscribed}
		<div
			class="flex items-center justify-between border-t border-surface-200 pt-4 text-xs dark:border-surface-800"
		>
			<span class="text-surface-500">Need to update payment method or tier?</span>
			<form method="POST" action="?/cancelSubscription" use:enhance>
				<button
					type="submit"
					class="text-[11px] text-error-600 uppercase hover:underline dark:text-error-400 cursor-pointer"
					onclick={(e) => {
						if (!confirm('Are you sure you want to cancel your active membership?')) {
							e.preventDefault();
						}
					}}
				>
					Cancel Membership
				</button>
			</form>
		</div>
	{/if}
</div>
