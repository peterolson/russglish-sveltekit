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

	// A coincidence is the claim that nothing was borrowed — that the two
	// languages arrived at the shape independently. Pairing it with 'borrowing',
	// or naming a source it was borrowed from, asserts both at once.
	if (e.derivationTypes.includes('coincidence')) {
		if (e.derivationTypes.includes('borrowing')) {
			throw new Error(
				`${e.entry} is marked both 'coincidence' and 'borrowing' — a shape either ` +
					`came from a shared source or it did not`
			);
		}
		if (e.borrowSources?.length) {
			throw new Error(
				`${e.entry} is marked 'coincidence' but names borrowSources ` +
					`(${e.borrowSources.join(', ')}); a coincidence is borrowed from nowhere`
			);
		}
	}

	// Exact duplicates first, so a true homophone reports as one rather than as
	// whichever ear happens to be checked first.
	claim(seenIpa, pron, e.entry, 'Duplicate pronunciation');
	claim(seenEnglishEar, englishEar(pron), e.entry, 'English-ear collision');
	claim(seenRussianEar, russianEar(pron), e.entry, 'Russian-ear collision');

	return { ...e, roman: romanizeNeutral(e.entry), ipa };
});

// DERIVATION. A derived entry has to be pronounceable as its parts run together:
// kreatIvAt is kreat'Iv + -At, /kreatɪv/ + /æt/. Checked in a second pass because
// a part may be defined after the word that uses it.
//
// Stress is stripped from both sides before comparing. It belongs to the whole
// word, not to the morphemes — kreat'Iv carries its own stress mark as a free
// word, and the joined form re-runs the default rule over the longer word — so
// comparing with stress in place would reject every correct derivation.
const byEntry = new Map(lexicon.map((e) => [e.entry, e]));

/** Look a word up by its neutral (canonical) form. */
export function entryFor(entry: string): DecodedEntry | undefined {
	return byEntry.get(entry);
}

const unstressed = (p: Pron): Pron => p.map((t) => (t.startsWith('ˈ') ? t.slice(1) : t));

for (const e of lexicon) {
	if (!e.derivedFrom?.length) continue;
	const joined = e.derivedFrom.flatMap((key) => {
		const part = byEntry.get(key);
		if (!part) {
			throw new Error(`${e.entry} is derived from "${key}", which is not in the lexicon`);
		}
		return unstressed(decodeNeutral(part.entry));
	});
	const whole = unstressed(decodeNeutral(e.entry));
	if (joined.join(' ') !== whole.join(' ')) {
		throw new Error(
			`Derivation mismatch for ${e.entry}: /${whole.join('')}/, but its parts ` +
				`(${e.derivedFrom.join(' + ')}) run together as /${joined.join('')}/`
		);
	}
}
