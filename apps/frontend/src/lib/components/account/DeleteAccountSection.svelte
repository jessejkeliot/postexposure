<script lang="ts">
	import { enhance } from '$app/forms';

	let deleteStep = $state<0 | 1 | 2>(0);
	let deleting = $state(false);
</script>

<section class="space-y-4 border border-error-500/30 bg-error-500/5 p-6">
	{#if deleteStep === 0}
		<div class="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center">
			<div class="text-xs text-surface-600 dark:text-surface-400">
				Once deleted, your account and associated session data cannot be recovered.
			</div>
			<button
				type="button"
				onclick={() => (deleteStep = 1)}
				class="btn self-start border border-error-600 px-4 py-2 text-xs font-bold tracking-wider text-error-600 uppercase transition-colors hover:bg-error-600 hover:text-white sm:self-auto dark:border-error-400 dark:text-error-400 cursor-pointer"
			>
				<span class="icon-[boxicons--trash]"></span>
				<span>Delete Account</span>
			</button>
		</div>
	{:else if deleteStep === 1}
		<!-- Confirmation Step 1 -->
		<div class="space-y-4 border border-warning-500/40 bg-warning-500/10 p-4">
			<div class="flex items-start gap-3">
				<span
					class="icon-[boxicons--alert-circle] mt-0.5 shrink-0 text-xs text-warning-600 dark:text-warning-400"
				></span>
				<div class="space-y-1 text-xs">
					<p class="font-bold tracking-wider text-warning-800 uppercase dark:text-warning-300">
						Are you sure?
					</p>
					<p class="text-surface-700 dark:text-surface-300">
						You will lose access to any active memberships and ticket reservations.
					</p>
				</div>
			</div>
			<div class="flex flex-col items-center gap-3 pt-1 sm:flex-row">
				<button
					type="button"
					onclick={() => (deleteStep = 2)}
					class="btn bg-error-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-error-700 cursor-pointer"
				>
					Yes, I Want to Proceed
				</button>
				<button
					type="button"
					onclick={() => (deleteStep = 0)}
					class="btn border border-surface-300 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors hover:bg-surface-200 dark:border-surface-700 dark:hover:bg-surface-800 cursor-pointer"
				>
					Cancel
				</button>
			</div>
		</div>
	{:else if deleteStep === 2}
		<!-- Confirmation Step 2 -->
		<div class="space-y-4 border border-error-600 bg-error-500/20 p-4">
			<div class="flex items-start gap-3">
				<span
					class="icon-[boxicons--alert-triangle] mt-0.5 shrink-0 text-xs text-error-600 dark:text-error-400"
				></span>
				<div class="space-y-1 text-xs">
					<p class="font-bold tracking-wider text-error-700 uppercase dark:text-error-300">
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
				class="flex flex-col items-center gap-3 pt-1 sm:flex-row"
			>
				<button
					type="submit"
					disabled={deleting}
					class="btn flex items-center gap-2 bg-error-600 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-error-700 disabled:opacity-50 cursor-pointer"
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
					class="btn border border-surface-300 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors hover:bg-surface-200 disabled:opacity-50 dark:border-surface-700 dark:hover:bg-surface-800 cursor-pointer"
				>
					Cancel & Keep Account
				</button>
			</form>
		</div>
	{/if}
</section>
