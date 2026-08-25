<script lang="ts">
	import { resolve } from '$app/paths';
	import TextView from '$lib/components/TextView.svelte';
	import { crumbs } from '$lib/data/texts';
	import { line } from '$lib/text/render';
	import { labels, useOrthography } from '$lib/ui/labels.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const t = labels();
	const orthography = useOrthography();
	// Folder names are the corpus's own labels (Bible, Genesis), not interface
	// text, so they stay as authored.
	const trail = $derived(crumbs(data.leaf.segments));
	// The tab reads in the same script as the page under it.
	const title = $derived(line(data.leaf.text.title, orthography.current));
</script>

<svelte:head>
	<title>{t.cap('site')} — {title}</title>
</svelte:head>

<main class="page">
	<nav class="trail">
		<a class="ortho" href={resolve('/texts')}>{t.cap('texts')}</a>
		{#each trail as name (name)}
			<span aria-hidden="true">/</span>
			<span>{name}</span>
		{/each}
	</nav>

	<TextView text={data.leaf.text} />
</main>

<style>
	.trail {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1.5rem;
		color: var(--ink-faint);
		font-size: 0.8rem;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		color: var(--ink);
	}
</style>
