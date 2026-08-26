<script lang="ts">
	let { children } = $props();
</script>

<div class="h-full w-full">
	<nav class="navbar mb-4 flex w-full flex-row items-center justify-between border-b-2 px-4 py-1">
		<button type="button" class="btn btn-icon p-0.5" title="Menu" aria-label="Menu">
			<span class="icon-[boxicons--menu] btn-icon-xl"></span>
		</button>
		<h1 class="font-bold tracking-wide font-stretch-110% xs:text-2xl sm:text-3xl">POST EXPOSURE</h1>
		<button type="button" class="btn btn-icon p-0.5" title="Menu" aria-label="Menu">
			<span class="icon-[boxicons--search] btn-icon-xl"></span>
		</button>
	</nav>
	<div class="h-full w-full px-4 mb-4">
		{@render children()}
	</div>
</div>
