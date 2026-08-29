// PERCEPTION (ear) projections — for the lexicon-wide INJECTIVITY check
// (principles.md §5), NOT for convergence. Each maps a canonical phoneme to the
// category a monolingual actually *hears*: the nearest thing in their own
// inventory. Two distinct words must not collide under either ear.
//
// The organising rule for the engineered compromise phones is that each ear
// gets its own side of the compromise — [s̺] is ⟨ṣ⟩/s to an English speaker and
// ⟨ш̣⟩/ш to a Russian, [t̪] is ⟨ṭ⟩/t and ⟨д̣⟩/d. That is exactly what makes them
// compromises, and it is why the two maps are not mirror images.
//
// Targets need NOT be Russglish phonemes — θ, ʃ, ʒ, x, ə are categories in the
// hearer's language, not ours. Only merges matter: a mapping that renames a
// phoneme nothing else maps onto cannot create a collision.

import type { Pron, Phoneme } from './ipa.ts';

// A phoneme may be heard as a SEQUENCE (English has no nasal vowel, so /ə̃/
// arrives as /an/), hence the array values.
type Ear = Record<string, Phoneme | Phoneme[]>;

// English ear: no retroflexes, no velar fricative, no palatal stop, no nasal
// vowels, and aspiration — not voicing — is what cues its stop contrast.
const ENGLISH_EAR: Ear = {
	t̪: 't', // ⟨ṭ⟩ — English side of the Grimm t↔d stop
	b͡β: 'b', // ⟨ḅ⟩ — English side of the Byzantine β; it hears the stop onset
	t̪θ: 'θ', // English HAS θ, so the dental affricate lands on it cleanly
	s̺: 's', // ⟨ṣ⟩ — English side of s↔ш; English /s/ is the laxer sibilant
	kx: 'k', // ⟨kh⟩ — no /x/ in English; the stop onset is what survives
	ɟ: 'dʒ', // ⟨g̱⟩ — English side of the dʒ↔г route
	ɦ: 'h', // ⟨ḥ⟩ — English side of the h↔г route; voicing is not contrastive on /h/
	ʂ: 'ʃ', // ш — no retroflex/alveolopalatal contrast; both are SHE
	ʐ: 'ʒ', // ж — MEASURE
	ə̃: ['a', 'n'] // no nasal vowels: -tion is heard as /ʃən/, i.e. vowel + nasal
	// NOT mapped, because they are positional and `apply` has no context:
	//   ts  — word-INITIALLY English hears /s/ or /z/ (tsunami, tsar), elsewhere it
	//         keeps the cluster (cats). A blanket ts→s would merge /kats/ with /kas/.
	//   ŋ   — contrastive in English (sin/sing) except word-initially, where it
	//         would be heard as /n/.
};

// Russian ear: no /h/, no /θ/, no /w/, no /æ/, no /ɪ/ apart from и, no nasal
// vowels, no diphthongs, and no phonemic /ŋ/. Palatalisation and final
// devoicing are already resolved by decodeRussian, so they are not repeated.
const RUSSIAN_EAR: Ear = {
	w: 'v', // no /w/ — в takes it
	t̪: 'd', // ⟨д̣⟩ — Russian side of the Grimm t↔d stop (to/до, two/два)
	b͡β: 'v', // ⟨в̱⟩ — Russian side of the Byzantine β; it hears the fricative release
	t̪θ: 't', // no /θ/; modern loans send it to т (Smith → Смит)
	s̺: 'ʂ', // ⟨ш̣⟩ — Russian side of s↔ш; Russian /s/ is too sharp to claim it
	kx: 'x', // ⟨х̣⟩ — Russian side of k↔x
	ɟ: 'g', // ⟨г̣⟩ — Russian side of the dʒ↔г route; [ɟ] is heard as /gʲ/
	ɦ: 'g', // ⟨г̱⟩ — Russian side of the h↔г route. MERGES with ɟ and plain g.
	h: 'x', // no /h/ — х takes it (hobby → хобби). MERGES with kx.
	ŋ: 'n', // allophonic before velars in Russian too, so this is lossless here
	ɪ: 'i', // no /ɪ/ — the ship/sheep merger, the single most likely collision
	æ: 'a', // no /æ/ (э is the other route, but а is the commoner hearing)
	əi: ['a', 'j'], // no diphthongs — ай
	ə̃: 'a' // no nasal vowels — the -ция vowel
	// NOT mapped: dʒ. Russian writes it дж and keeps it apart from ж, so merging
	// them would reject words the language can actually afford to distinguish.
};

const STRESS = 'ˈ';

// Stress rides on the vowel token ("ˈæ"), so it has to come off before the
// lookup and go back on afterwards — onto the FIRST token, since a phoneme can
// expand into several.
const apply = (p: Pron, m: Ear): Pron =>
	p.flatMap((t) => {
		const stressed = t.startsWith(STRESS);
		const base = stressed ? t.slice(STRESS.length) : t;
		const heard = m[base] ?? base;
		const toks = Array.isArray(heard) ? heard : [heard];
		return stressed ? [STRESS + toks[0], ...toks.slice(1)] : toks;
	});

export const englishEar = (p: Pron): Pron => apply(p, ENGLISH_EAR);
export const russianEar = (p: Pron): Pron => apply(p, RUSSIAN_EAR);
