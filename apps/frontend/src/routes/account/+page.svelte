<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	const membershipPageFlag = false;
	let { data, form }: PageProps = $props();

	let updating = $state(false);
	let deleteStep = $state<0 | 1 | 2>(0);
	let deleting = $state(false);

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
		<!-- Left: Profile Details -->
		<div
			class="space-y-6 border border-surface-300 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900"
		>
			<div>
				<span class="text-[10px] tracking-widest text-surface-500 uppercase">Profile</span>
				<h2 class="mt-1 text-xl font-bold tracking-tight uppercase">Personal Details</h2>
			</div>

			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={() => {
					updating = true;
					return async ({ update }) => {
						updating = false;
						await update();
					};
				}}
				class="space-y-4 text-xs"
			>
				<div>
					<label for="name" class="mb-1 block font-bold tracking-wider text-surface-500 uppercase">
						Name
					</label>
					<input
						id="name"
						name="name"
						type="text"
						defaultValue={data.user?.name || ''}
						required
						class="w-full border bg-surface-100 px-3 py-2 font-medium outline-none focus:border-surface-950 dark:bg-surface-800 dark:focus:border-surface-50"
					/>
				</div>

				<div>
					<label for="email" class="mb-1 block font-bold tracking-wider text-surface-500 uppercase">
						Email Address
					</label>
					<input
						id="email"
						type="email"
						value={data.user?.email}
						disabled
						class="w-full cursor-not-allowed border bg-surface-200/50 px-3 py-2 text-[11px] text-surface-500 dark:bg-surface-800/50"
					/>
				</div>
				{#if data.user?.role !== 'user'}
					<div>
						<span class="mb-1 block font-bold tracking-wider text-surface-500 uppercase">
							Role
						</span>
						<span
							class="inline-block bg-surface-200 px-2 py-0.5 text-[11px] font-semibold uppercase dark:bg-surface-800"
						>
							{data.user?.role || 'User'}
						</span>
					</div>
				{/if}

				<button
					type="submit"
					disabled={updating}
					class="w-full bg-surface-950 py-2.5 font-bold tracking-wider text-surface-50 uppercase transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-surface-50 dark:text-surface-950"
				>
					{updating ? 'Saving...' : 'Update Details'}
				</button>
			</form>
		</div>

		<!-- Middle/Right: Membership Status -->
		{#if membershipPageFlag}
			<div
				class="flex flex-col justify-between space-y-6 border border-surface-300 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900"
			>
				<div>
					<div class="flex items-center justify-between">
						<div>
							<span class="text-[10px] tracking-widest text-surface-500 uppercase"
								>Subscription</span
							>
							<h2 class="mt-1 text-xl font-bold tracking-tight uppercase">Membership Plan</h2>
						</div>
						{#if data.user?.isSubscribed}
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

					{#if data.user?.isSubscribed}
						<div class="mt-6 space-y-3 border border-emerald-500/30 bg-emerald-500/5 p-4">
							<div class="flex items-baseline justify-between">
								<div>
									<span class="text-[10px] text-surface-500 uppercase">Current Tier</span>
									<h3
										class="text-2xl font-bold tracking-tight text-emerald-600 uppercase dark:text-emerald-400"
									>
										{data.user.subscriptionTier || 'Supporter Membership'}
									</h3>
								</div>
								{#if data.user.subscriptionExpiresAt}
									<div class="text-right">
										<span class="text-[10px] text-surface-500 uppercase">Expires / Renews</span>
										<p class="text-xs font-bold">{formatDate(data.user.subscriptionExpiresAt)}</p>
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

				{#if data.user?.isSubscribed}
					<div
						class="flex items-center justify-between border-t border-surface-200 pt-4 text-xs dark:border-surface-800"
					>
						<span class="text-surface-500">Need to update payment method or tier?</span>
						<form method="POST" action="?/cancelSubscription" use:enhance>
							<button
								type="submit"
								class=" text-[11px] text-error-600 uppercase hover:underline dark:text-error-400"
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
		{/if}
	</div>

	<!-- Previous Purchases Section -->
	<section class="space-y-4">
		<div class="flex items-end justify-between border-b pb-3">
			<div>
				<span class="text-[10px] tracking-widest text-surface-500 uppercase">Receipts & Orders</span
				>
				<h2 class="text-2xl font-bold tracking-tight uppercase">Purchase History</h2>
			</div>
			<span class="text-xs text-surface-500 uppercase">
				{data.purchases.length}
				{data.purchases.length === 1 ? 'transaction' : 'transactions'}
			</span>
		</div>

		{#if data.purchases.length > 0}
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
						{#each data.purchases as purchase (purchase.id)}
							<tr class="transition-colors hover:bg-surface-100/60 dark:hover:bg-surface-800/40">
								<td class="p-3 whitespace-nowrap text-surface-600 dark:text-surface-400">
									{formatDate(purchase.created)}
								</td>
								<td class="p-3 font-sans font-medium text-surface-900 dark:text-surface-100">
									<div class="flex items-center gap-2">
										<span>{purchase.item_name}</span>
										{#if purchase.type === 'issue' && purchase.item_id}
											<a
												href={resolve(`/issues/success?session_id=${purchase.stripe_payment_id || purchase.id}&issue_id=${purchase.item_id}`)}
												class="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase underline hover:opacity-80 ml-2"
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
				<span class="mx-auto icon-[boxicons--receipt] block text-3xl opacity-30"></span>
				<p class="text-sm font-bold tracking-tight uppercase">No Previous Purchases</p>
				<p class="mx-auto max-w-sm text-xs text-surface-500">
					When you purchase magazine issues, membership subscriptions, or screening tickets, your
					order history and receipts will be recorded here.
				</p>
			</div>
		{/if}
	</section>

	<!-- Danger Zone: Delete Account -->
	<section class="border border-error-500/30 bg-error-500/5 p-6 space-y-4">
		{#if deleteStep === 0}
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
				<div class="text-xs text-surface-600 dark:text-surface-400">
					Once deleted, your account and associated session data cannot be recovered.
				</div>
				<button
					type="button"
					onclick={() => (deleteStep = 1)}
					class="btn border border-error-600 text-error-600 hover:bg-error-600 hover:text-white dark:border-error-400 dark:text-error-400 text-xs font-bold tracking-wider uppercase px-4 py-2 transition-colors self-start sm:self-auto cursor-pointer"
				>
					<span class="icon-[boxicons--trash]"></span>
					<span>Delete Account</span>
				</button>
			</div>
		{:else if deleteStep === 1}
			<!-- Confirmation Step 1 -->
			<div class="space-y-4 border border-warning-500/40 bg-warning-500/10 p-4">
				<div class="flex items-start gap-3">
					<span class="icon-[boxicons--alert-circle] text-warning-600 dark:text-warning-400 text-xs shrink-0 mt-0.5"></span>
					<div class="space-y-1 text-xs">
						<p class="font-bold uppercase tracking-wider text-warning-800 dark:text-warning-300">
							Are you sure?
						</p>
						<p class="text-surface-700 dark:text-surface-300">
							You will lose access to any active memberships and ticket reservations.
						</p>
					</div>
				</div>
				<div class="flex items-center flex-col sm:flex-row gap-3 pt-1">
					<button
						type="button"
						onclick={() => (deleteStep = 2)}
						class="btn bg-error-600 text-white hover:bg-error-700 text-xs font-bold tracking-wider uppercase px-4 py-2 transition-colors cursor-pointer"
					>
						Yes, I Want to Proceed
					</button>
					<button
						type="button"
						onclick={() => (deleteStep = 0)}
						class="btn border border-surface-300 dark:border-surface-700 text-xs font-bold tracking-wider uppercase px-4 py-2 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors cursor-pointer"
					>
						Cancel
					</button>
				</div>
			</div>
		{:else if deleteStep === 2}
			<!-- Confirmation Step 2 -->
			<div class="space-y-4 border border-error-600 bg-error-500/20 p-4">
				<div class="flex items-start gap-3">
					<span class="icon-[boxicons--alert-triangle] text-error-600 dark:text-error-400 text-xs shrink-0 mt-0.5"></span>
					<div class="space-y-1 text-xs">
						<p class="font-bold uppercase tracking-wider text-error-700 dark:text-error-300">
							Are you really sure?
						</p>
					</div>
				</div>
				<form
					method="POST"
					action="?/deleteAccount"
					use:enhance={() => {
						deleting = true;
						return async ({ update }) => {
							deleting = false;
							await update();
						};
					}}
					class="flex items-center gap-3 flex-col sm:flex-row pt-1"
				>
					<button
						type="submit"
						disabled={deleting}
						class="btn bg-error-600 text-white hover:bg-error-700 text-xs font-bold tracking-wider uppercase px-5 py-2.5 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
					>
						{#if deleting}
							<span class="icon-[boxicons--loader-lines] animate-spin text-sm"></span>
							<span>Deleting Account...</span>
						{:else}
							<span class="icon-[boxicons--trash]"></span>
							<span>Delete My Account</span>
						{/if}
					</button>
					<button
						type="button"
						disabled={deleting}
						onclick={() => (deleteStep = 0)}
						class="btn border border-surface-300 dark:border-surface-700 text-xs font-bold tracking-wider uppercase px-4 py-2.5 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors cursor-pointer disabled:opacity-50"
					>
						Cancel & Keep Account
					</button>
				</form>
			</div>
		{/if}
	</section>
</div>
