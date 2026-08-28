<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Sentence } from '$lib/data/schema.types';
	import { pieces, words } from '$lib/text/render';
	import { labels, useOrthography, useSources } from '$lib/ui/labels.svelte';

	type Props = { sentence: Sentence; heading?: boolean };
	let { sentence, heading = false }: Props = $props();

	// Which WORD the reader is pointing at — the gloss is a property of the word.
	// Null when nothing is active; the gloss row keeps its height either way so
	// the page does not jump.
	let active = $state<number | null>(null);

	const orthography = useOrthography();
	const sources = useSources();
	const t = labels();
	const line = $derived(words(sentence, orthography.current));
	const en = $derived(pieces(sentence, 'en'));
	const ru = $derived(pieces(sentence, 'ru'));
	const shown = $derived(active === null ? null : line[active]);
	// ...but HIGHLIGHTING is a property of the phrase. One word of a phrase does
	// not correspond to any part of the source on its own, so pointing at it
	// lights the whole unit on all three lines.
	const lit = $derived(shown?.phrase ?? null);
	// No phrases means nobody has translated this line yet.
	const pending = $derived(sentence.phrases.length === 0);
</script>

<div class="sentence" class:heading class:pending>
	{#if sentence.label}<span class="label" aria-hidden="true">{sentence.label}</span>{/if}

	<p class="russglish ortho">
		{#if pending}<span class="waiting" aria-label={t('noText')}>—</span>{/if}
		{#each line as word (word.index)}{word.before}<button
				type="button"
				class="word"
				class:active={word.phrase === lit}
				onmouseenter={() => (active = word.index)}
				onmouseleave={() => (active = null)}
				onfocus={() => (active = word.index)}
				onblur={() => (active = null)}>{word.form}</button
			>{word.after + (word.space ? ' ' : '')}{/each}
	</p>

	{#if sources.en}
		<p class="source ortho" lang="en">
			{#each en as piece, i (i)}<span
					class="piece"
					class:active={piece.phrase !== null && piece.phrase === lit}>{piece.text}</span
				>{/each}
		</p>
	{/if}

	{#if sources.ru}
		<p class="source ortho" lang="ru">
			{#each ru as piece, i (i)}<span
					class="piece"
					class:active={piece.phrase !== null && piece.phrase === lit}>{piece.text}</span
				>{/each}
		</p>
	{/if}

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
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	/* Verse numbers hang in the left margin where there is room for them, and
	   fall back to sitting above the line on a narrow screen. */
	.label {
		position: absolute;
		left: -2.25rem;
		width: 2rem;
		text-align: right;
		color: var(--ink-faint);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		line-height: 1.9;
	}

	@media (max-width: 52rem) {
		.label {
			position: static;
			width: auto;
			text-align: left;
			line-height: 1.4;
		}
	}

	/* An untranslated verse keeps its sources but reads as unfinished, so the
	   remaining work is visible by scrolling rather than by counting. */
	.pending .source {
		color: var(--ink-faint);
	}

	.waiting {
		color: var(--rule);
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
