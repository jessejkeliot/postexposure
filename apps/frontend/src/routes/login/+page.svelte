<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { signIn, signUp } from '$lib/auth-client';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let mode = $state<'login' | 'register'>('login');
	let email = $state('');
	let password = $state('');
	let name = $state('');
	let role = $state<'user' | 'admin'>('user');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;

		try {
			if (mode === 'login') {
				const res = await signIn.email({
					email,
					password
				});

				if (res.error) {
					error = res.error.message || 'Failed to sign in. Please check your credentials.';
					loading = false;
					return;
				}
			} else {
				if (!name.trim()) {
					error = 'Please enter your full name.';
					loading = false;
					return;
				}

				const res = await signUp.email({
					email,
					password,
					name,
					// @ts-expect-error extra fields
					role
				});

				if (res.error) {
					error = res.error.message || 'Failed to register account.';
					loading = false;
					return;
				}
			}

			await invalidateAll();
			goto(data.redirectTo || '/account');
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred.';
			loading = false;
		}
	}

	async function loginAs(demoEmail: string, demoPass: string) {
		email = demoEmail;
		password = demoPass;
		error = null;
		loading = true;
		try {
			const res = await signIn.email({
				email: demoEmail,
				password: demoPass
			});
			if (res.error) {
				error = res.error.message || 'Demo sign-in failed.';
				loading = false;
				return;
			}
			await invalidateAll();
			goto(data.redirectTo || '/account');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Demo sign-in failed.';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Sign In' : 'Create Account'} | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-md px-2">
	<!-- Brand Header -->
	<div class="border-b pb-4 text-center">
		<h1 class="mt-2 text-3xl sm:text-5xl font-bold tracking-tight uppercase">
			{mode === 'login' ? 'Member Sign In' : 'Join Post Exposure'}
		</h1>
		<p class="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-400">
			{mode === 'login'
				? 'Access your tickets, subscription archive, and account history.'
				: 'Create your account for screenings, tickets, and publication access.'}
		</p>
	</div>

	<!-- Mode Switcher Tabs -->
	<div class="mt-6 flex border">
		<button
			type="button"
			class="flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-150 {mode === 'login'
				? 'bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950'
				: 'bg-transparent hover:bg-surface-200/50 dark:hover:bg-surface-800/50'}"
			onclick={() => {
				mode = 'login';
				error = null;
			}}
		>
			Sign In
		</button>
		<button
			type="button"
			class="flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-l transition-colors duration-150 {mode === 'register'
				? 'bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950'
				: 'bg-transparent hover:bg-surface-200/50 dark:hover:bg-surface-800/50'}"
			onclick={() => {
				mode = 'register';
				error = null;
			}}
		>
			Register
		</button>
	</div>

	<!-- Error Box -->
	{#if error}
		<div class="mt-4 border border-error-500/50 bg-error-500/10 p-3 text-xs text-error-600 dark:text-error-400">
			<div class="flex items-center gap-2">
				<span class="icon-[boxicons--alert-circle] text-base"></span>
				<span>{error}</span>
			</div>
		</div>
	{/if}

	<!-- Form -->
	<form onsubmit={handleSubmit} class="mt-6 space-y-4">
		{#if mode === 'register'}
			<div>
				<label for="name" class="block text-xs font-bold uppercase tracking-wider mb-1">
					Full Name
				</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					placeholder="Jean-Luc Godard"
					class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:bg-surface-900 dark:border-surface-700 dark:focus:border-surface-100"
				/>
			</div>

			<div>
				<label for="role" class="block text-xs font-bold uppercase tracking-wider mb-1">
					Account Role
				</label>
				<select
					id="role"
					bind:value={role}
					class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:bg-surface-900 dark:border-surface-700 dark:focus:border-surface-100"
				>
					<option value="user">Film Enthusiast / Reader</option>
					<option value="admin">Curator / Venue Administrator</option>
				</select>
			</div>
		{/if}

		<div>
			<label for="email" class="block text-xs font-bold uppercase tracking-wider mb-1">
				Email Address
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				placeholder="curator@postexposure.film"
				class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:bg-surface-900 dark:border-surface-700 dark:focus:border-surface-100"
			/>
		</div>

		<div>
			<label for="password" class="block text-xs font-bold uppercase tracking-wider mb-1">
				Password
			</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				required
				placeholder="••••••••"
				minlength={6}
				class="w-full border bg-surface-50 px-3 py-2 text-sm outline-none focus:border-surface-950 dark:bg-surface-900 dark:border-surface-700 dark:focus:border-surface-100"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full mt-2 py-3 bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950 font-bold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2"
		>
			{#if loading}
				<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
				<span>Processing...</span>
			{:else}
				<span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
			{/if}
		</button>
	</form>

	<!-- Demo Quick Logins -->
	<div class="mt-10 border-t pt-6">
		<p class="text-xs uppercase font-bold tracking-wider text-surface-500 mb-3 text-center">
			Quick Demo Profiles
		</p>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
			<button
				type="button"
				onclick={() => loginAs('admin@postexposure.film', 'Password123!')}
				class="border py-2 px-2 text-left hover:bg-surface-200/50 dark:hover:bg-surface-800/50 text-xs transition-colors"
			>
				<span class="font-bold block uppercase text-[10px] text-primary-500">Admin</span>
				<span class="font-medium truncate block">Curator Admin</span>
			</button>
			<button
				type="button"
				onclick={() => loginAs('member@postexposure.film', 'Password123!')}
				class="border py-2 px-2 text-left hover:bg-surface-200/50 dark:hover:bg-surface-800/50 text-xs transition-colors"
			>
				<span class="font-bold block uppercase text-[10px] text-tertiary-500">Subscribed</span>
				<span class="font-medium truncate block">Alex Rivers</span>
			</button>
			<button
				type="button"
				onclick={() => loginAs('viewer@postexposure.film', 'Password123!')}
				class="border py-2 px-2 text-left hover:bg-surface-200/50 dark:hover:bg-surface-800/50 text-xs transition-colors"
			>
				<span class="font-bold block uppercase text-[10px] text-surface-500">Standard</span>
				<span class="font-medium truncate block">Morgan Lee</span>
			</button>
		</div>
	</div>
</div>
