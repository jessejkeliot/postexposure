<script lang="ts">
	import type { User } from '$lib/types/database';

	interface Props {
		adminUser?: User | null;
	}

	let { adminUser }: Props = $props();
</script>

<div class="mb-6 flex items-center justify-between border-b pb-3 text-xs">
	<span class="tracking-wider text-surface-500 uppercase">
		POST EXPOSURE // DOOR SCANNER
	</span>
	{#if adminUser}
		<span class="text-emerald-600 dark:text-emerald-400">
			Admin: {adminUser.name || adminUser.email}
		</span>
	{:else}
		<span class="text-error-500">Not Authenticated</span>
	{/if}
</div>
