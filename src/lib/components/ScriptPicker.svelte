<script lang="ts">
	import {
		capitalizeIn,
		ORTHOGRAPHY_COOKIE,
		ORTHOGRAPHIES,
		type Orthography
	} from '$lib/orthography';
	import { labels, phrase, useOrthography, type UiKey } from '$lib/ui/labels.svelte';

	const state = useOrthography();
	const t = labels();

	// Each option names itself IN the orthography it selects, so the menu is its
	// own specimen: the reader sees what they are choosing before choosing it.
	// That also means the option labels do NOT change with the current selection.
	const option: Record<Orthography, UiKey> = {
		en: 'english',
		neutral: 'neutral',
		ru: 'russian',
		ipa: 'ipa'
	};
</script>

<label>
	<span class="ortho">{t.cap('script')}</span>
	<select
		class="ortho"
		value={state.current}
		onchange={(event) => state.choose(event.currentTarget.value as Orthography, ORTHOGRAPHY_COOKIE)}
	>
		{#each ORTHOGRAPHIES as value (value)}
			<!-- Capitalized here rather than taken as stored: some of these words are
			     proper nouns in the lexicon and some are not, and a menu should not
			     inherit that unevenness. IPA opts out, having no capitals. -->
			<option {value}>{capitalizeIn(phrase(option[value], value), value)}</option>
		{/each}
	</select>
</label>

<style>
	label {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		color: var(--ink-faint);
		font-size: 0.8rem;
	}

	select {
		border: 1px solid var(--rule);
		border-radius: 5px;
		background: var(--fill);
		padding: 0.15rem 0.4rem;
		color: var(--ink);
		font-size: 0.85rem;
	}

	select:hover {
		border-color: var(--ink-faint);
	}

	/* The native menu renders options in the control's font, so the orthography
	   samples keep their combining marks. */
	option {
		font-family: var(--ortho);
	}
</style>
