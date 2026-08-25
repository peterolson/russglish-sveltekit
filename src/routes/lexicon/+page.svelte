<script lang="ts">
	import { entryFor, lexicon } from '$lib/data/lexicon';
	import { formOf } from '$lib/orthography';
	import { labels, useOrthography } from '$lib/ui/labels.svelte';

	const orthography = useOrthography();
	const t = labels();

	// A part is always a lexicon entry (lexicon.ts refuses to load otherwise), so
	// the fallback is only here to keep the render total.
	const form = (key: string) => {
		const entry = entryFor(key);
		return entry ? formOf(entry, orthography.current) : key;
	};
</script>

<svelte:head>
	<title>{t.cap('site')} — {t.cap('lexicon')}</title>
</svelte:head>

{#snippet chips(label: string, values: readonly string[])}
	<div class="chips">
		<span class="chip-label ortho">{label}</span>
		{#each values as value (value)}
			<span class="chip">{value}</span>
		{/each}
	</div>
{/snippet}

<main class="page">
	<h1 class="ortho">{t.cap('lexicon')}</h1>
	<p class="count ortho">{lexicon.length} {t('entries')}</p>

	<div class="entries">
		{#each lexicon as entry (entry.entry)}
			<article id={entry.entry}>
				<header>
					<h2 class="ortho">{formOf(entry, orthography.current)}</h2>
					<span class="ipa">{entry.ipa}</span>
					<code class="neutral" title="neutral orthography (canonical, typeable)"
						>{entry.entry}</code
					>
					{#if entry.morphType && entry.morphType !== 'word'}
						<span class="morph ortho">{t(entry.morphType === 'prefix' ? 'prefix' : 'suffix')}</span>
					{/if}
				</header>

				<table>
					<thead>
						<tr>
							<th class="row-label"><span class="visually-hidden">{t('spelling')}</span></th>
							<th class="ortho">{t('english')}</th>
							<th class="ortho">{t('russian')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th class="row-label ortho">{t('spelling')}</th>
							<td class="ortho">{entry.entryEn}</td>
							<td class="ortho">{entry.entryRu}</td>
						</tr>
						<tr>
							<th class="row-label ortho">{t('gloss')}</th>
							<td>{entry.glossEn}</td>
							<td>{entry.glossRu}</td>
						</tr>
						<tr>
							<th class="row-label ortho">{t('source')}</th>
							<td>{entry.sourceEn}</td>
							<td>{entry.sourceRu}</td>
						</tr>
					</tbody>
				</table>

				<footer>
					{#if entry.derivedFrom?.length}
						<div class="chips">
							<span class="chip-label ortho">{t('builtFrom')}</span>
							{#each entry.derivedFrom as part, i (part)}
								{#if i > 0}<span class="join">+</span>{/if}
								<span class="chip ortho">{form(part)}</span>
							{/each}
						</div>
					{/if}
					{#if entry.senseShift}
						{@render chips(t('sense'), [entry.senseShift])}
					{/if}
					{@render chips(t('partOfSpeech'), entry.partOfSpeech)}
					{@render chips(t('derivation'), entry.derivationTypes)}
					{#if entry.borrowSources?.length}
						{@render chips(t('borrowedFrom'), entry.borrowSources)}
					{/if}
				</footer>
			</article>
		{/each}
	</div>
</main>

<style>
	h1 {
		margin-bottom: 0.15rem;
		font-size: 1.6rem;
	}

	.count {
		margin: 0 0 1.5rem;
		color: light-dark(#666, #999);
		font-size: 0.85rem;
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	article {
		border: 1px solid light-dark(#ddd, #333);
		border-radius: 8px;
		padding: 1rem 1.25rem 0.75rem;
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	h2 {
		margin: 0;
		font-size: 1.35rem;
	}

	/* IPA is combining-mark text too (/t̪θ/, /ə̃/), so it takes the orthography
	   face rather than a sans stack that would have to be composed from two. */
	.ipa {
		font-family: var(--ortho);
		color: light-dark(#555, #aaa);
		font-size: 1.05rem;
	}

	/* The canonical typeable form: kept visible but subordinate to the reading form. */
	.neutral {
		border: 1px solid light-dark(#e0e0e0, #333);
		border-radius: 4px;
		background: light-dark(#f6f6f6, #1c1c1c);
		padding: 0.05rem 0.35rem;
		color: light-dark(#777, #888);
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
		font-size: 0.78rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}

	th,
	td {
		text-align: left;
		padding: 0.35rem 0.6rem 0.35rem 0;
		vertical-align: baseline;
	}

	thead th {
		border-bottom: 1px solid light-dark(#eee, #2a2a2a);
		color: light-dark(#666, #999);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.row-label {
		width: 5.5rem;
		color: light-dark(#888, #777);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-top: 0.9rem;
		padding-top: 0.75rem;
		border-top: 1px solid light-dark(#eee, #2a2a2a);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
	}

	.chip-label {
		width: 7.5rem;
		flex-shrink: 0;
		color: light-dark(#888, #777);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.chip {
		border: 1px solid light-dark(#e0e0e0, #333);
		border-radius: 999px;
		background: light-dark(#f6f6f6, #1c1c1c);
		padding: 0.1rem 0.5rem;
		font-size: 0.78rem;
	}

	.join {
		color: light-dark(#aaa, #666);
		font-size: 0.78rem;
	}

	/* Bound morphemes are not words; say so next to the headword rather than
	   letting -ät sit in the list looking like one. */
	.morph {
		color: light-dark(#8a3d1f, #e5a37e);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
</style>
