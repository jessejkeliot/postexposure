<script lang="ts">
	let {children} = $props();
</script>

<div class="w-full h-full">
<nav class="navbar flex flex-row justify-between items-center p-2 w-full">
    <button type="button" class="btn-icon preset-outlined btn-xl p-0.5" title="Menu" aria-label="Menu">
        <span class="icon-[boxicons--menu] btn-icon-xl"></span>
	</button>
	<h1 class="sm:text-3xl xs:text-2xl font-bold font-stretch-110% tracking-wide">POST EXPOSURE</h1>
    <button type="button" class="btn-icon preset-filled btn-xl p-0.5" title="Menu" aria-label="Menu">
        <span class="icon-[boxicons--search-alt] btn-icon-xl"></span>
	</button>
</nav>
<div class="w-full h-full px-4">
    {@render children()}
</div>
</div>