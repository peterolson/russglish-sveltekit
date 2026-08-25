<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import ScriptPicker from '$lib/components/ScriptPicker.svelte';
	import { labels, provideOrthography } from '$lib/ui/labels.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Provided here rather than in a module-level store: module state is shared
	// across requests on the server, which would leak one reader's choice into
	// the next reader's page.
	//
	// untrack because the server value is only a SEED. Once the page is live the
	// picker owns the orthography, and re-reading data on every navigation would
	// fight it — the cookie the picker writes is what the next load reads.
	provideOrthography(untrack(() => data.orthography));
	const t = labels();

	const links = [
		{ id: '/', label: 'site' },
		{ id: '/texts', label: 'texts' },
		{ id: '/lexicon', label: 'lexicon' }
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<div class="page">
		<ul>
			{#each links as link (link.id)}
				<li>
					<a
						class="ortho"
						href={resolve(link.id)}
						aria-current={page.url.pathname === resolve(link.id) ? 'page' : undefined}
					>
						{t.cap(link.label)}
					</a>
				</li>
			{/each}
		</ul>
		<ScriptPicker />
	</div>
</nav>

{@render children()}

<style>
	nav {
		border-bottom: 1px solid var(--rule-faint);
	}

	.page {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem 1.5rem;
		padding-block: 0.75rem;
	}

	ul {
		display: flex;
		gap: 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		color: var(--ink-soft);
		font-size: 0.95rem;
		text-decoration: none;
	}

	a:hover,
	a[aria-current='page'] {
		color: var(--ink);
	}
</style>
