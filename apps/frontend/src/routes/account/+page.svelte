<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import ProfileForm from '$lib/components/account/ProfileForm.svelte';
	import MembershipPlanCard from '$lib/components/account/MembershipPlanCard.svelte';
	import PurchaseHistoryTable from '$lib/components/account/PurchaseHistoryTable.svelte';
	import DeleteAccountSection from '$lib/components/account/DeleteAccountSection.svelte';

	const membershipPageFlag = false;
	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Account Management | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-10 py-6">
	<!-- Account Header -->
	<header
		class="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end"
	>
		<div>
			{#if data.user?.role === 'admin'}
				<div class="mb-1 flex items-center gap-2">
					<span class="text-xs tracking-widest text-surface-500 uppercase">
						Administrator Portal
					</span>
				</div>
			{/if}
			<h1 class="text-3xl font-bold tracking-tight uppercase sm:text-5xl">Account Overview</h1>
			<p class="mt-1 text-xs text-surface-600 sm:text-sm dark:text-surface-400">
				Manage your membership profile, credentials, and transaction history.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href={resolve('/tickets')}
				class="btn preset-outlined text-xs font-bold tracking-wider uppercase"
			>
				<span class="icon-[boxicons--tickets]"></span>
				My Tickets ({data.tickets.length})
			</a>
			<a
				href="/logout"
				class="btn preset-tonal text-xs font-bold tracking-wider uppercase transition-colors hover:bg-error-500/20 hover:text-error-600"
			>
				<span class="icon-[boxicons--door-open]"></span>
				Log Out
			</a>
		</div>
	</header>

	<!-- Feedback Notice -->
	{#if form?.message}
		<div
			class="border p-4 text-xs font-medium {form.success
				? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
				: 'border-error-500/40 bg-error-500/10 text-error-600 dark:text-error-400'}"
		>
			<div class="flex items-center gap-2">
				<span
					class="icon-[{form.success
						? 'boxicons--check-circle'
						: 'boxicons--alert-circle'}] text-base"
				></span>
				<span>{form.message}</span>
			</div>
		</div>
	{/if}

	<!-- Profile and Membership Grid -->
	<div class="grid grid-cols-1 gap-8">
		<ProfileForm user={data.user} />

		{#if membershipPageFlag}
			<MembershipPlanCard user={data.user} />
		{/if}
	</div>

	<!-- Previous Purchases Section -->
	<PurchaseHistoryTable purchases={data.purchases} />

	<!-- Danger Zone: Delete Account -->
	<DeleteAccountSection />
</div>
