<script lang="ts">
	import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<div class="space-y-6 py-4">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 gap-4">
		<div>
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">About</h1>
		</div>
	</header>
    <div class="prose prose-neutral dark:prose-invert max-w-none prose-lg leading-relaxed">
		{#if data.about.content}
			{@html data.about.content}
		{/if}
	</div>
</div>