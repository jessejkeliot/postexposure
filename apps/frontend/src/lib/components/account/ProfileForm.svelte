<script lang="ts">
	import { enhance } from '$app/forms';
	import type { User } from '$lib/types/database';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();
	let updating = $state(false);
</script>

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
				defaultValue={user?.name || ''}
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
				value={user?.email}
				disabled
				class="w-full cursor-not-allowed border bg-surface-200/50 px-3 py-2 text-[11px] text-surface-500 dark:bg-surface-800/50"
			/>
		</div>
		{#if user?.role !== 'user'}
			<div>
				<span class="mb-1 block font-bold tracking-wider text-surface-500 uppercase">
					Role
				</span>
				<span
					class="inline-block bg-surface-200 px-2 py-0.5 text-[11px] font-semibold uppercase dark:bg-surface-800"
				>
					{user?.role || 'User'}
				</span>
			</div>
		{/if}

		<button
			type="submit"
			disabled={updating}
			class="btn preset-filled w-full py-2.5 font-bold tracking-wider uppercase disabled:opacity-50 cursor-pointer"
		>
			{updating ? 'Saving...' : 'Update Details'}
		</button>
	</form>
</div>
