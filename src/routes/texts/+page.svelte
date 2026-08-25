<script lang="ts">
	import TextTree from '$lib/components/TextTree.svelte';
	import { allTexts, textTree } from '$lib/data/texts';
</script>

<svelte:head>
	<title>Russglish — Texts</title>
</svelte:head>

<main class="page">
	<h1>Texts</h1>
	<p class="count">{allTexts.length} {allTexts.length === 1 ? 'text' : 'texts'}</p>

	<TextTree nodes={textTree} />
</main>

<style>
	h1 {
		margin-bottom: 0.15rem;
		font-size: 1.6rem;
	}

	.count {
		margin: 0 0 1.5rem;
		color: var(--ink-soft);
		font-size: 0.85rem;
	}
</style>
