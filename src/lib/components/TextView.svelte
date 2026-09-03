<script lang="ts">
	import SentenceView from './SentenceView.svelte';
	import type { Text } from '$lib/data/schema.types';
	import { closes } from '$lib/text/render';
	import { labels, useSources } from '$lib/ui/labels.svelte';

	const t = labels();
	const sources = useSources();

	type Props = { text: Text };
	let { text }: Props = $props();

	// Digits, not words: how much of a scaffolded text is done reads the same in
	// every orthography.
	const done = $derived(text.sentences.filter((sentence) => sentence.phrases.length).length);
</script>

<article>
	<header>
		<SentenceView sentence={text.title} heading />
		{#if text.sentences.length > 1}
			<p class="progress">{done} / {text.sentences.length}</p>
		{/if}

		{#if text.sentences.length}
			<!-- Each switch is written in the language it reveals, not in Russglish and
			     not in the other one. It is addressed to a reader who wants that
			     language, and it is the one thing on the page that has to be legible
			     before you can read anything else. -->
			<div class="sources">
				<label lang="en">
					<input
						type="checkbox"
						checked={sources.en}
						onchange={(event) => sources.show('en', event.currentTarget.checked)}
					/>
					Show English translation
				</label>
				<label lang="ru">
					<input
						type="checkbox"
						checked={sources.ru}
						onchange={(event) => sources.show('ru', event.currentTarget.checked)}
					/>
					Показать русский перевод
				</label>
			</div>
		{/if}
	</header>

	{#if text.sentences.length}
		<div class="body">
			{#each text.sentences as sentence, i (i)}
				<SentenceView {sentence} opens={i === 0 || closes(text.sentences[i - 1])} />
			{/each}
		</div>
	{:else}
		<p class="empty ortho">{t('noText')}</p>
	{/if}
</article>

<style>
	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin-top: 0.9rem;
	}

	.sources label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--ink-faint);
		font-size: 0.8rem;
		cursor: pointer;
	}

	.sources label:hover {
		color: var(--ink-soft);
	}

	.sources input {
		margin: 0;
		accent-color: var(--accent);
		cursor: pointer;
	}

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
