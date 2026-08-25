<script lang="ts">
	import { lexicon } from '$lib/data/lexicon';
</script>

<svelte:head>
	<title>Russglish — Lexicon</title>
</svelte:head>

{#snippet chips(label: string, values: readonly string[])}
	<div class="chips">
		<span class="chip-label">{label}</span>
		{#each values as value (value)}
			<span class="chip">{value}</span>
		{/each}
	</div>
{/snippet}

<main class="page">
	<h1>Lexicon</h1>
	<p class="count">{lexicon.length} {lexicon.length === 1 ? 'entry' : 'entries'}</p>

	<div class="entries">
		{#each lexicon as entry (entry.entry)}
			<article>
				<header>
					<h2 class="ortho">{entry.roman}</h2>
					<span class="ipa">{entry.ipa}</span>
					<code class="neutral" title="neutral orthography (canonical, typeable)"
						>{entry.entry}</code
					>
				</header>

				<table>
					<thead>
						<tr>
							<th class="row-label"><span class="visually-hidden">Field</span></th>
							<th>English</th>
							<th>Russian</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th class="row-label">Spelling</th>
							<td class="ortho">{entry.entryEn}</td>
							<td class="ortho">{entry.entryRu}</td>
						</tr>
						<tr>
							<th class="row-label">Gloss</th>
							<td>{entry.glossEn}</td>
							<td>{entry.glossRu}</td>
						</tr>
						<tr>
							<th class="row-label">Source</th>
							<td>{entry.sourceEn}</td>
							<td>{entry.sourceRu}</td>
						</tr>
					</tbody>
				</table>

				<footer>
					{@render chips('Part of speech', entry.partOfSpeech)}
					{@render chips('Derivation', entry.derivationTypes)}
					{#if entry.borrowSources?.length}
						{@render chips('Borrowed from', entry.borrowSources)}
					{/if}
				</footer>
			</article>
		{/each}
	</div>
</main>

<style>
	:global(html) {
		color-scheme: light dark;
	}

	.page {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		font-family:
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			sans-serif;
		line-height: 1.45;
	}

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

	/* Orthography cells carry combining marks (a̱ и̣), so prefer a face that
	   positions them properly and give them room to breathe. */
	.ortho {
		font-family: 'Gentium Plus', 'Charis SIL', 'DejaVu Serif', Georgia, serif;
		font-feature-settings: 'ccmp', 'mark';
	}

	.ipa {
		font-family: 'Gentium Plus', 'Charis SIL', 'DejaVu Sans', sans-serif;
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

	.visually-hidden {
		position: absolute;
		clip-path: inset(50%);
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
