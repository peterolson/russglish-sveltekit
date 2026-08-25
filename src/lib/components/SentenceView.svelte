<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Sentence } from '$lib/data/schema.types';
	import { pieces, words } from '$lib/text/render';

	type Props = { sentence: Sentence; heading?: boolean };
	let { sentence, heading = false }: Props = $props();

	// Which token the reader is pointing at. Null when nothing is active; the
	// gloss row keeps its height either way so the page does not jump.
	let active = $state<number | null>(null);

	const line = $derived(words(sentence));
	const en = $derived(pieces(sentence, 'en'));
	const ru = $derived(pieces(sentence, 'ru'));
	const shown = $derived(active === null ? null : line[active]);
</script>

<div class="sentence" class:heading>
	<p class="russglish ortho">
		{#each line as word (word.index)}{word.before}<button
				type="button"
				class="word"
				class:active={active === word.index}
				onmouseenter={() => (active = word.index)}
				onmouseleave={() => (active = null)}
				onfocus={() => (active = word.index)}
				onblur={() => (active = null)}>{word.roman}</button
			>{word.after + ' '}{/each}
	</p>

	<p class="source ortho" lang="en">
		{#each en as piece, i (i)}<span
				class="piece"
				class:active={piece.index !== null && piece.index === active}>{piece.text}</span
			>{/each}
	</p>

	<p class="source ortho" lang="ru">
		{#each ru as piece, i (i)}<span
				class="piece"
				class:active={piece.index !== null && piece.index === active}>{piece.text}</span
			>{/each}
	</p>

	<p class="gloss" aria-live="polite">
		{#if shown}
			<a class="ipa" href="{resolve('/lexicon')}#{encodeURIComponent(shown.neutral)}">
				{shown.ipa}
			</a>
			<span lang="en">{shown.glossEn}</span>
			<span class="sep">·</span>
			<span lang="ru">{shown.glossRu}</span>
		{/if}
	</p>
</div>

<style>
	.sentence {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	p {
		margin: 0;
	}

	.russglish {
		font-size: 1.25rem;
	}

	.heading .russglish {
		font-size: 1.9rem;
		line-height: 1.2;
	}

	.word {
		border: 0;
		border-radius: 3px;
		background: none;
		padding: 0;
		color: inherit;
		font: inherit;
		cursor: help;
	}

	.word.active {
		background: var(--mark);
		box-shadow: 0 0 0 2px var(--mark);
	}

	.source {
		color: var(--ink-soft);
		font-size: 0.95rem;
	}

	.piece.active {
		border-radius: 3px;
		background: var(--mark);
		box-shadow: 0 0 0 2px var(--mark);
		color: var(--ink);
	}

	.gloss {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		min-height: 1.5rem;
		margin-top: 0.35rem;
		color: var(--ink-faint);
		font-size: 0.82rem;
	}

	.ipa {
		font-family: var(--ortho);
		color: var(--accent);
		text-decoration: none;
	}

	.ipa:hover {
		text-decoration: underline;
	}

	.sep {
		color: var(--rule);
	}
</style>
