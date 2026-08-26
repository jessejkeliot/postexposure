<script lang="ts">
	let {children} = $props();
</script>

<div class="w-full h-full">
<nav class="navbar flex flex-row justify-between items-center px-4 py-1 w-full border-b-2 mb-4">
    <button type="button" class="btn-icon btn p-0.5" title="Menu" aria-label="Menu">
        <span class="icon-[boxicons--menu] btn-icon-xl"></span>
	</button>
	<h1 class="sm:text-3xl xs:text-2xl font-bold font-stretch-110% tracking-wide">POST EXPOSURE</h1>
    <button type="button" class="btn-icon btn p-0.5" title="Menu" aria-label="Menu">
        <span class="icon-[boxicons--search] btn-icon-xl"></span>
	</button>
</nav>
<div class="w-full h-full px-4">
    {@render children()}
</div>
</div>