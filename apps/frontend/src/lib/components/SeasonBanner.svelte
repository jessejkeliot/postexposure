<script lang="ts">
    // get the current season

	let image_url = $state(
		'https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster.png/0/images/masterrepository/other/01_EverettCollection_TexasChainSawMassacre.JPG'
	);
    let text_shadow = $state(true);
</script>

<div class="relative justify-left">
	<!-- Darkened background -->
	<div
		class="absolute inset-0 bg-cover bg-center brightness-85 banner-in-triangle w-4/5"
		style={`background-image: url("${image_url}")`}
	></div>

	<!-- Image only appears inside text -->
	<h1
		class="px-4 w-4/5 relative text-2xl sm:text-3xl text-center font-bold font-roboto italic bg-cover bg-clip-text text-transparent after:blur-xs brightness-200 contrast-150 bg-[position:30%_60%] bg-size-[200%_200%] {text_shadow ? "text-shadow-sm md:text-shadow-lg text-shadow-surface-200" : ""}"
		style={`background-image: url("${image_url}")`}
	>
		Halloween Season
	</h1>
</div>
