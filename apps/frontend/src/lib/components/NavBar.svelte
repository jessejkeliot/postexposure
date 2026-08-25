<script lang="ts">
	let {children} = $props();
</script>

<div class="w-full h-full">
<nav class="navbar flex flex-row justify-between p-4 w-full bg-white text-black">
    <button>X</button>
	<h1 class="text-xl font-bold font-stretch-110%">POST EXPOSURE</h1>
    <button>=</button>
</nav>
<div class="w-full h-full px-4">
    {@render children()}
</div>
</div>