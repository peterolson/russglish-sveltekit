<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ id: '/', label: 'Russglish' },
		{ id: '/texts', label: 'Texts' },
		{ id: '/lexicon', label: 'Lexicon' }
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<ul class="page">
		{#each links as link (link.id)}
			<li>
				<a
					href={resolve(link.id)}
					aria-current={page.url.pathname === resolve(link.id) ? 'page' : undefined}
				>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

{@render children()}

<style>
	nav {
		border-bottom: 1px solid var(--rule-faint);
	}

	ul {
		display: flex;
		gap: 1.25rem;
		margin: 0;
		padding-block: 0.75rem;
		list-style: none;
	}

	a {
		color: var(--ink-soft);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		text-transform: uppercase;
	}

	a:hover,
	a[aria-current='page'] {
		color: var(--ink);
	}
</style>
