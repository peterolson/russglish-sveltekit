import { decodeNeutral } from '$lib/phonology/decode-neutral';
import { decodeRussian } from '$lib/phonology/decode-russian';
import { decodeEnglish } from '$lib/phonology/decode-english';
import _lexicon from './lexicon.json';
import type { LexiconEntry } from './schema.types';
import { prettyIPA, type Pron } from '$lib/phonology/ipa';
import { englishEar, russianEar } from '$lib/phonology/projections';
import { romanizeNeutral } from '$lib/phonology/romanize';

// A lexicon entry plus its reading form and its pronunciation. There is only
// ONE `ipa` field because convergence is the whole point: the three orthographies
// must decode to the same phonemes, and the loop below throws if they don't.
export type DecodedEntry = LexiconEntry & { roman: string; ipa: string };

// INJECTIVITY. Beyond "no two entries share a pronunciation", no two entries may
// be indistinguishable to a monolingual either: the projections in
// ../phonology/projections.ts collapse each word onto what one ear can actually
// resolve, and a collision there is a word pair that half the speakers cannot
// tell apart. Each map holds heard-form → the entry that got there first.
const seenIpa = new Map<string, string>();
const seenEnglishEar = new Map<string, string>();
const seenRussianEar = new Map<string, string>();

function claim(seen: Map<string, string>, heard: Pron, entry: string, how: string): void {
	// Space-separated: multi-character phonemes must not run together into a key
	// that a different token sequence could also produce.
	const key = heard.join(' ');
	const prior = seen.get(key);
	if (prior !== undefined) {
		throw new Error(`${how}: ${entry} and ${prior} are both /${heard.join('')}/`);
	}
	seen.set(key, entry);
}

export const lexicon: DecodedEntry[] = (_lexicon as LexiconEntry[]).map((e) => {
	const pron = decodeNeutral(e.entry);
	const ipa = prettyIPA(pron);
	const enIpa = prettyIPA(decodeEnglish(e.entryEn));
	const ruIpa = prettyIPA(decodeRussian(e.entryRu));

	if (ipa !== enIpa) {
		throw new Error(`English IPA mismatch for ${e.entry}: ${ipa} !== ${enIpa}`);
	}
	if (ipa !== ruIpa) {
		throw new Error(`Russian IPA mismatch for ${e.entry}: ${ipa} !== ${ruIpa}`);
	}

	// Exact duplicates first, so a true homophone reports as one rather than as
	// whichever ear happens to be checked first.
	claim(seenIpa, pron, e.entry, 'Duplicate pronunciation');
	claim(seenEnglishEar, englishEar(pron), e.entry, 'English-ear collision');
	claim(seenRussianEar, russianEar(pron), e.entry, 'Russian-ear collision');

	return { ...e, roman: romanizeNeutral(e.entry), ipa };
});
