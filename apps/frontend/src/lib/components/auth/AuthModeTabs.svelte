<script lang="ts">
	interface Props {
		mode: 'login' | 'register';
		onSelectMode: (mode: 'login' | 'register') => void;
	}

	let { mode, onSelectMode }: Props = $props();
</script>

<div class="mt-6 flex border">
	<button
		type="button"
		class="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 sm:text-sm cursor-pointer {mode ===
		'login'
			? 'bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950'
			: 'bg-transparent hover:bg-surface-200/50 dark:hover:bg-surface-800/50'}"
		onclick={() => onSelectMode('login')}
	>
		Sign In
	</button>
	<button
		type="button"
		class="flex-1 border-l py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 sm:text-sm cursor-pointer {mode ===
		'register'
			? 'bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950'
			: 'bg-transparent hover:bg-surface-200/50 dark:hover:bg-surface-800/50'}"
		onclick={() => onSelectMode('register')}
	>
		Register
	</button>
</div>
