<script lang="ts">
	interface Props {
		mode: 'login' | 'register';
		loading: boolean;
		email: string;
		password: string;
		name: string;
		role: 'user' | 'admin';
		onSubmit: (e: SubmitEvent) => void;
	}

	let {
		mode,
		loading,
		email = $bindable(),
		password = $bindable(),
		name = $bindable(),
		role = $bindable(),
		onSubmit
	}: Props = $props();
</script>

<form onsubmit={onSubmit} class="mt-6 space-y-4">
	{#if mode === 'register'}
		<div>
			<label for="name" class="mb-1 block text-xs font-bold tracking-wider uppercase">
				Full Name
			</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				required
				placeholder="Jean-Luc Godard"
				class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:border-surface-700 dark:bg-surface-900 dark:focus:border-surface-100"
			/>
		</div>

		<div>
			<label for="role" class="mb-1 block text-xs font-bold tracking-wider uppercase">
				Account Role
			</label>
			<select
				id="role"
				bind:value={role}
				class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:border-surface-700 dark:bg-surface-900 dark:focus:border-surface-100"
			>
				<option value="user">Film Enthusiast / Reader</option>
				<option value="admin">Curator / Venue Administrator</option>
			</select>
		</div>
	{/if}

	<div>
		<label for="email" class="mb-1 block text-xs font-bold tracking-wider uppercase">
			Email Address
		</label>
		<input
			id="email"
			type="email"
			bind:value={email}
			required
			placeholder="curator@postexposure.film"
			class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:border-surface-700 dark:bg-surface-900 dark:focus:border-surface-100"
		/>
	</div>

	<div>
		<label for="password" class="mb-1 block text-xs font-bold tracking-wider uppercase">
			Password
		</label>
		<input
			id="password"
			type="password"
			bind:value={password}
			required
			placeholder="••••••••"
			minlength={6}
			class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:border-surface-700 dark:bg-surface-900 dark:focus:border-surface-100"
		/>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="btn preset-filled mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
	>
		{#if loading}
			<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
			<span>Processing...</span>
		{:else}
			<span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
		{/if}
	</button>
</form>
