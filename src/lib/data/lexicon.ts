import { decodeNeutral } from '$lib/phonology/decode-neutral';
import { decodeRussian } from '$lib/phonology/decode-russian';
import { decodeEnglish } from '$lib/phonology/decode-english';
import _lexicon from './lexicon.json';
import type { LexiconEntry } from './schema.types';
import { prettyIPA } from '$lib/phonology/ipa';
import { romanizeNeutral } from '$lib/phonology/romanize';

// A lexicon entry plus its reading form and its pronunciation. There is only
// ONE `ipa` field because convergence is the whole point: the three orthographies
// must decode to the same phonemes, and the loop below throws if they don't.
export type DecodedEntry = LexiconEntry & { roman: string; ipa: string };

export const lexicon: DecodedEntry[] = (_lexicon as LexiconEntry[]).map((e) => {
	const ipa = prettyIPA(decodeNeutral(e.entry));
	const enIpa = prettyIPA(decodeEnglish(e.entryEn));
	const ruIpa = prettyIPA(decodeRussian(e.entryRu));

	if (ipa !== enIpa) {
		throw new Error(`English IPA mismatch for ${e.entry}: ${ipa} !== ${enIpa}`);
	}
	if (ipa !== ruIpa) {
		throw new Error(`Russian IPA mismatch for ${e.entry}: ${ipa} !== ${ruIpa}`);
	}

	return { ...e, roman: romanizeNeutral(e.entry), ipa };
});
