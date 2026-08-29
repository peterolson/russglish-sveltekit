// Core IPA representation and the (temporary, maximal) vowel-fuzzing comparison.
//
// A pronunciation is an array of phoneme *tokens* (multi-char phonemes like
// "t̪θ", "kx", "ts", "dʒ" are single tokens). The neutral/canonical column
// stores these space-separated; the English/Russian decoders produce them.

export type Phoneme = string;
export type Pron = Phoneme[];

// The Russglish consonant inventory (settled in ../phonology.md). Anything NOT
// in this set is treated as a vowel for fuzzing purposes.
// The Grimm t↔d compromise stop: unaspirated dental, English /t/ ↔ Russian /d/
// (to/до, two/два, water/вода). Written ṭ (English) / д̣ (Russian); neutral D.
export const DENTAL_T: Phoneme = 't̪';

// The Byzantine-beta compromise affricate: English /b/ ↔ Russian /v/. Greek β
// went b → β → v over its history, and the two parents took their words off
// that road at different points — English through Latin while it was still a
// stop, Russian through Byzantine Greek once it had become a fricative:
// symbol/символ, Abraham/Авраам, alphabet/алфавит, Babylon/Вавилон. A bilabial
// stop with a fricative release is the stage they both passed through, which is
// why each ear can still hear its own side of it. Written ḅ (English) / в̱
// (Russian); neutral B.
export const BETA: Phoneme = 'b͡β';

export const CONSONANTS = new Set<Phoneme>([
	DENTAL_T, // unaspirated dental stop (Grimm t↔d)
	BETA, // voiced bilabial affricate (Byzantine β: b↔v)
	'p',
	't',
	'k',
	'b',
	'd',
	'g',
	'm',
	'n',
	'ŋ',
	's',
	'z',
	'f',
	'v',
	'r',
	'l',
	'j',
	'w',
	'h',
	'ʂ',
	'ʐ', // ш, ж
	'tʃ',
	'dʒ', // ч, дж
	'ts', // ц
	't̪θ', // dental affricate (θ↔t)
	'kx', // Greek-χ affricate (k↔x)
	'ɦ', // h↔г route
	'ɟ', // /dʒ/↔г route (general)
	's̺' // retracted s (s↔ш compromise)
]);

export function isConsonant(t: Phoneme): boolean {
	return CONSONANTS.has(t);
}

// TEMPORARY vowel fuzz (v1): keep consonants only, drop every vowel. This
// tolerates vowel quality AND syllable-count differences while we work out the
// vowel system. Tighten later (e.g. keep vowel slots, then qualities).
export function consonantSkeleton(p: Pron): Pron {
	return p.filter(isConsonant);
}

export function skeletonEqual(a: Pron, b: Pron): boolean {
	const sa = consonantSkeleton(a);
	const sb = consonantSkeleton(b);
	return sa.length === sb.length && sa.every((t, i) => t === sb[i]);
}

// Exact, full-IPA equality (vowels included) — the defuzzed comparison.
export function pronEqual(a: Pron, b: Pron): boolean {
	return a.length === b.length && a.every((t, i) => t === b[i]);
}

// Stress placement: explicit override (token index of the stressed vowel, from a
// typeable `'` in the spelling) wins; otherwise the DEFAULT RULE — penultimate
// syllable (Spanish-style). Nuclei = full vowels (ə̃ doesn't count — it's the
// -tion glide; syllabic sonorants are consonant tokens). A word with ≤1 nucleus
// takes no mark (stress is trivial). Returns the token list with ˈ on the
// stressed vowel. Applied to the (identical) segments, it's consistent across
// all three columns, so regular words need no mark anywhere.
export function placeStress(tokens: Pron, explicitIdx: number | null): Pron {
	const nuclei: number[] = [];
	tokens.forEach((t, i) => {
		if (!isConsonant(t) && t !== 'ə̃') nuclei.push(i);
	});
	let pos: number | null;
	if (explicitIdx != null) pos = explicitIdx;
	else if (nuclei.length <= 1)
		pos = null; // monosyllable → no mark
	else pos = nuclei[nuclei.length - 2]; // penultimate
	if (pos == null) return tokens;
	return tokens.map((t, i) => (i === pos ? 'ˈ' + t : t));
}

// Display only: render IPA with the stress mark at the start of the stressed
// SYLLABLE (before its onset consonants) rather than right before the vowel.
// /tsˈentr/ → /ˈtsentr/, /ʐɪrˈæf/ → /ʐɪˈræf/. Does not affect the canonical form.
export function prettyIPA(p: Pron): string {
	const idx = p.findIndex((t) => t.startsWith('ˈ'));
	if (idx < 0) return '/' + p.join('') + '/';
	const toks = p.map((t) => (t.startsWith('ˈ') ? t.slice(1) : t));
	let j = idx; // walk left over the onset cluster to the previous vowel / start
	while (j > 0 && isConsonant(toks[j - 1])) j--;
	return '/' + [...toks.slice(0, j), 'ˈ', ...toks.slice(j)].join('') + '/';
}
