<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="space-y-3 border-2 border-red-500 bg-red-50 p-6 text-center dark:bg-red-950/40">
	<div class="text-xl font-bold text-red-600 uppercase dark:text-red-400">
		Screening is Sold Out
	</div>
	<p class="text-xs opacity-80">
		All seats for this session have been reserved. Please check other dates or screenings in the
		calendar.
	</p>
	<a
		href={resolve('/calendar')}
		class="inline-block border-2 border-surface-950 px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-surface-950 hover:text-surface-50 dark:border-surface-50 dark:hover:bg-surface-50 dark:hover:text-surface-950 cursor-pointer"
	>
		Browse Calendar
	</a>
</div>
