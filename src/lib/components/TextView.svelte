<script lang="ts">
	import SentenceView from './SentenceView.svelte';
	import type { Text } from '$lib/data/schema.types';

	type Props = { text: Text };
	let { text }: Props = $props();
</script>

<article>
	<header>
		<SentenceView sentence={text.title} heading />
	</header>

	{#if text.sentences.length}
		<div class="body">
			{#each text.sentences as sentence, i (i)}
				<SentenceView {sentence} />
			{/each}
		</div>
	{:else}
		<p class="empty">Not yet translated.</p>
	{/if}
</article>

<style>
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
