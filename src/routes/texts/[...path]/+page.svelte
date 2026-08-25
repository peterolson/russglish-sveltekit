<script lang="ts">
	import { resolve } from '$app/paths';
	import TextView from '$lib/components/TextView.svelte';
	import { crumbs } from '$lib/data/texts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const trail = $derived(crumbs(data.leaf.segments));
</script>

<svelte:head>
	<title>Russglish — {data.leaf.name}</title>
</svelte:head>

<main class="page">
	<nav class="trail">
		<a href={resolve('/texts')}>Texts</a>
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
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		color: var(--ink);
	}
</style>
