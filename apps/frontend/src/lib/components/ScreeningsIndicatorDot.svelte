<script lang="ts">
    interface Props {
		hasScreenings: boolean;
        isSelected: boolean;
        size?: number;
	}

	let { hasScreenings, isSelected, size=1.5}: Props = $props();
</script>

{#if hasScreenings}
	<span class="h-{size} aspect-square rounded-full {isSelected ? 'bg-primary-400' : 'bg-primary-600'}"></span>
{/if}
