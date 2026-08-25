<script lang="ts">
	import SentenceView from './SentenceView.svelte';
	import type { Text } from '$lib/data/schema.types';
	import { labels } from '$lib/ui/labels.svelte';

	const t = labels();

	type Props = { text: Text };
	let { text }: Props = $props();

	// Digits, not words: how much of a scaffolded text is done reads the same in
	// every orthography.
	const done = $derived(text.sentences.filter((sentence) => sentence.tokens.length).length);
</script>

<article>
	<header>
		<SentenceView sentence={text.title} heading />
		{#if text.sentences.length > 1}
			<p class="progress">{done} / {text.sentences.length}</p>
		{/if}
	</header>

	{#if text.sentences.length}
		<div class="body">
			{#each text.sentences as sentence, i (i)}
				<SentenceView {sentence} />
			{/each}
		</div>
	{:else}
		<p class="empty ortho">{t('noText')}</p>
	{/if}
</article>

<style>
	.progress {
		margin: 0.5rem 0 0;
		color: var(--ink-faint);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}

	header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--rule-faint);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.empty {
		color: var(--ink-faint);
		font-size: 0.9rem;
		font-style: italic;
	}
</style>
