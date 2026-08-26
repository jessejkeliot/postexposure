<script lang="ts">
    // get the current season

	let image_url = $state(
		'https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster.png/0/images/masterrepository/other/01_EverettCollection_TexasChainSawMassacre.JPG'
	);
</script>

<div class="relative">
	<!-- Darkened background -->
	<div
		class="absolute inset-0 bg-cover bg-center brightness-85 banner-in-out-triangle"
		style={`background-image: url("${image_url}")`}
	></div>

	<!-- Image only appears inside text -->
	<h1
		class="px-4 relative text-3xl text-center font-bold font-roboto italic bg-cover bg-clip-text text-transparent brightness-200 contrast-150  bg-[position:30%_60%] text-shadow-sm md:text-shadow-lg text-shadow-surface-200"
		style={`background-image: url("${image_url}")`}
	>
		Halloween Season
	</h1>
</div>
