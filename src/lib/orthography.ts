// The four ways to write a Russglish word. Every entry already carries all four
// — that is the point of the convergence check — so switching between them is a
// display choice, never a translation.

import type { DecodedEntry } from './data/lexicon';

export type Orthography = 'en' | 'neutral' | 'ru' | 'ipa';

export const ORTHOGRAPHIES = ['en', 'neutral', 'ru', 'ipa'] as const;

export const ORTHOGRAPHY_COOKIE = 'skript';

export function isOrthography(value: unknown): value is Orthography {
	return typeof value === 'string' && (ORTHOGRAPHIES as readonly string[]).includes(value);
}

export function formOf(entry: DecodedEntry, orthography: Orthography): string {
	switch (orthography) {
		case 'en':
			return entry.entryEn;
		case 'ru':
			return entry.entryRu;
		case 'neutral':
			return entry.roman;
		case 'ipa':
			// The stored form is bracketed for display on its own (/tekst/). In running
			// text every word would carry its own pair of slashes, so they come off and
			// the line reads as one transcription.
			return entry.ipa.replace(/^\/|\/$/g, '');
	}
}

/** IPA is a transcription, not a writing system: it has no capital letters. */
export function capitalizes(orthography: Orthography): boolean {
	return orthography !== 'ipa';
}

/**
 * Capitalize a word, unless the orthography has no capitals. The first character
 * may be followed by a combining mark (the stress acute, the precision marks),
 * which slice() carries along untouched.
 */
export function capitalizeIn(text: string, orthography: Orthography): string {
	if (!capitalizes(orthography) || !text) return text;
	return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/**
 * Pick a starting orthography from an Accept-Language header (or
 * navigator.languages joined by commas). A Russian speaker gets the Cyrillic
 * column, everyone else the Latin one — the two reader orthographies exist
 * precisely so that neither side has to read the other's.
 *
 * Ranked by q-value rather than by first appearance, because "en;q=0.9,ru;q=0.5"
 * prefers English despite ru occurring in it.
 */
export function preferredOrthography(acceptLanguage: string | null | undefined): Orthography {
	const best = (acceptLanguage ?? '')
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params.find((p) => p.trim().startsWith('q='));
			return { tag: tag.trim().toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
		})
		.filter((entry) => entry.tag && !Number.isNaN(entry.q))
		.sort((a, b) => b.q - a.q)[0];

	return best?.tag.startsWith('ru') ? 'ru' : 'en';
}
