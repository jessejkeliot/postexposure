<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { signIn, signUp } from '$lib/auth-client';
	import type { PageProps } from './$types';
	import AuthModeTabs from '$lib/components/auth/AuthModeTabs.svelte';
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import DemoProfilesBar from '$lib/components/auth/DemoProfilesBar.svelte';

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
		<h1 class="mt-2 text-3xl font-bold tracking-tight uppercase sm:text-5xl">
			{mode === 'login' ? 'Member Sign In' : 'Join Post Exposure'}
		</h1>
		<p class="mt-2 text-xs text-surface-600 sm:text-sm dark:text-surface-400">
			{mode === 'login'
				? 'Access your tickets, subscription archive, and account history.'
				: 'Create your account for screenings, tickets, and publication access.'}
		</p>
	</div>

	<!-- Mode Switcher Tabs -->
	<AuthModeTabs
		{mode}
		onSelectMode={(m) => {
			mode = m;
			error = null;
		}}
	/>

	<!-- Error Box -->
	{#if error}
		<div
			class="mt-4 border border-error-500/50 bg-error-500/10 p-3 text-xs text-error-600 dark:text-error-400"
		>
			<div class="flex items-center gap-2">
				<span class="icon-[boxicons--alert-circle] text-base"></span>
				<span>{error}</span>
			</div>
		</div>
	{/if}

	<!-- Form -->
	<AuthForm
		{mode}
		{loading}
		bind:email
		bind:password
		bind:name
		bind:role
		onSubmit={handleSubmit}
	/>

	<!-- Demo Quick Logins -->
	<DemoProfilesBar onSelectProfile={loginAs} />
</div>
