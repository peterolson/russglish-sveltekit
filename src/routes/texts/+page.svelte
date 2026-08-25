<script lang="ts">
	import TextTree from '$lib/components/TextTree.svelte';
	import { allTexts, textTree } from '$lib/data/texts';
	import { labels } from '$lib/ui/labels.svelte';

	const t = labels();
</script>

<svelte:head>
	<title>{t.cap('site')} — {t.cap('texts')}</title>
</svelte:head>

<main class="page">
	<h1 class="ortho">{t.cap('texts')}</h1>
	<p class="count ortho">{allTexts.length} {t('texts')}</p>

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
