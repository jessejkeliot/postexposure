<script lang="ts">
	interface Props {
		onSelectProfile: (email: string, pass: string) => void;
	}

	let { onSelectProfile }: Props = $props();
</script>

<div class="mt-10 border-t pt-6">
	<p class="mb-3 text-center text-xs font-bold tracking-wider text-surface-500 uppercase">
		Quick Demo Profiles
	</p>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
		<button
			type="button"
			onclick={() => onSelectProfile('admin@postexposure.film', 'Password123!')}
			class="btn preset-outlined flex flex-col items-start px-2 py-2 text-left text-xs transition-colors cursor-pointer"
		>
			<span class="block text-[10px] font-bold text-primary-500 uppercase">Admin</span>
			<span class="block truncate font-medium">Curator Admin</span>
		</button>
		<button
			type="button"
			onclick={() => onSelectProfile('member@postexposure.film', 'Password123!')}
			class="btn preset-outlined flex flex-col items-start px-2 py-2 text-left text-xs transition-colors cursor-pointer"
		>
			<span class="block text-[10px] font-bold text-tertiary-500 uppercase">Subscribed</span>
			<span class="block truncate font-medium">Alex Rivers</span>
		</button>
		<button
			type="button"
			onclick={() => onSelectProfile('viewer@postexposure.film', 'Password123!')}
			class="btn preset-outlined flex flex-col items-start px-2 py-2 text-left text-xs transition-colors cursor-pointer"
		>
			<span class="block text-[10px] font-bold text-surface-500 uppercase">Standard</span>
			<span class="block truncate font-medium">Morgan Lee</span>
		</button>
	</div>
</div>
