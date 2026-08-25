// English-orthography → canonical phonemes, vowels INCLUDED (recognition-strict,
// deterministic). A Rosenfelder-style ordered recipe:
//   consonant digraphs/marks  →  vowel digraphs  →  magic-e  →
//   single-vowel long/short by consonant context  →  exception marks
//
// Per https://www.zompist.com/spell.html, no rule set hits 100% on raw English
// (his 86 rules = 59% perfect), so the residue is handled by NATIVE devices
// first — consonant doubling (forces short), silent-e (forces long), digraph
// choice — and by two ignorable vowel marks only as a last resort:
//   underdot  (Ṿ)  = flip the rule's long/short prediction   (vi̱deo → /ɪ/)
//   macron-below (V̲) = the /a/-exotic value: a→/a/(PALM), o→/u/  (ma̲ma, do̲)
// Casual readers skip the marks; the decoder reads them.

import { placeStress, DENTAL_T, type Pron } from './ipa.ts';
import { DOT, UMAC, ACUTE } from './marks.ts';

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u']);
const isVowelLetter = (c: string | undefined) => !!c && VOWEL_LETTERS.has(c);

const DIGRAPH3: Record<string, string> = { igh: 'əi' };
const DIGRAPH2: Record<string, string> = {
	ee: 'i',
	ea: 'i',
	ie: 'i',
	ei: 'i',
	oo: 'u',
	ou: 'u',
	ue: 'u',
	ui: 'u',
	ew: 'u',
	oa: 'o',
	ow: 'o',
	au: 'o',
	aw: 'o',
	ai: 'e',
	ay: 'e',
	ey: 'e'
};
const LONG: Record<string, string> = { a: 'e', e: 'i', i: 'əi', o: 'o', u: 'u', y: 'əi' };
const SHORT: Record<string, string> = { a: 'æ', e: 'e', i: 'ɪ', o: 'o', u: 'a', y: 'ɪ' };
const MACRON_ALT: Record<string, string> = { a: 'a', o: 'u', e: 'a', i: 'i', u: 'u', y: 'i' };

const SINGLE_CONS: Record<string, string> = {
	p: 'p',
	t: 't',
	k: 'k',
	b: 'b',
	d: 'd',
	m: 'm',
	n: 'n',
	s: 's',
	z: 'z',
	f: 'f',
	v: 'v',
	r: 'r',
	l: 'l'
};
const CONS_LETTERS = new Set('bcdfghjklmnpqrstvwxz'.split(''));

// Is the single vowel at `i` "long"? (magic-e, hiatus, or single intervocalic C.)
// Counts consonant LETTERS to the next vowel/boundary, skipping combining marks
// and treating '-'/' ' as a word end.
function isLong(s: string, i: number): boolean {
	let j = i + 1;
	let cc = 0;
	while (j < s.length) {
		const ch = s[j];
		if (ch === DOT || ch === UMAC || ch === ACUTE || ch === "'") {
			j++;
			continue;
		} // skip marks/stress
		if (ch === '-' || ch === ' ') break; // morpheme boundary = end
		if (CONS_LETTERS.has(ch)) {
			cc++;
			j++;
			continue;
		}
		break; // hit a vowel
	}
	const atEnd = j >= s.length || s[j] === '-' || s[j] === ' ';
	const nextIsVowel = !atEnd && VOWEL_LETTERS.has(s[j]);
	if (cc === 0) return true; // V# or hiatus
	if (cc === 1 && nextIsVowel) return true; // VCV / magic-e → long
	return false; // VC# or VCC… → short
}

export function decodeEnglish(word: string): Pron {
	// hyphenated compound: each part is its own stress domain (decode separately)
	if (word.includes('-')) return word.split('-').filter(Boolean).flatMap(decodeEnglish);
	const s = word.toLowerCase();
	const n = s.length;
	const out: Pron = [];
	let i = 0;
	let explicitIdx: number | null = null;

	const prevEmitted = () => out[out.length - 1];

	while (i < n) {
		const c = s[i];
		const c2 = s.slice(i, i + 2);
		const rest = s.slice(i);

		if (c === '-' || c === ' ' || c === ACUTE) {
			i += 1;
			continue;
		}

		// -tion → /tsiə̃/
		if (rest === 'tion') {
			out.push('ts', 'i', 'ə̃');
			i += 4;
			continue;
		}

		// ---- marked consonants & consonant digraphs (order matters) ----
		if (c === 't' && s[i + 1] === DOT && s[i + 2] === 'h') {
			out.push('f');
			i += 3;
			continue;
		} // ṭh→f
		if (c === 't' && s[i + 1] === DOT) {
			out.push(DENTAL_T);
			i += 2;
			continue;
		} // ṭ→[t̪] (Grimm t↔d)
		if (c === 's' && s[i + 1] === DOT) {
			out.push('s̺');
			i += 2;
			continue;
		} // ṣ→[s̺]
		if (c2 === 'th') {
			out.push('t̪θ');
			i += 2;
			continue;
		}
		if (c2 === 'ch') {
			out.push('tʃ');
			i += 2;
			continue;
		}
		if (c2 === 'kh') {
			out.push('kx');
			i += 2;
			continue;
		}
		if (c2 === 'sh') {
			out.push('ʂ');
			i += 2;
			continue;
		}
		if (c2 === 'ph') {
			out.push('f');
			i += 2;
			continue;
		}
		if (c2 === 'ck') {
			out.push('k');
			i += 2;
			continue;
		}
		if (c2 === 'qu') {
			out.push('k', 'w');
			i += 2;
			continue;
		}

		// ---- silent / syllabic e ----
		// silent final 'e' (magic-e or French -e): final 'e' after a consonant, in a
		// word longer than 2 letters that already has a vowel (skips be/me/he/we/the).
		if (
			c === 'e' &&
			i === n - 1 &&
			CONS_LETTERS.has(s[i - 1]) &&
			n > 2 &&
			/[aeiou]/.test(s.slice(0, i - 1))
		) {
			i += 1;
			continue;
		}
		// syllabic r/l/n: unstressed 'e' right before a word-final r/l/n → no vowel
		if (c === 'e' && ['r', 'l', 'n'].includes(s[i + 1]) && i + 2 === n) {
			i += 1;
			continue;
		}

		// ---- vowels ----
		if (isVowelLetter(c) || (c === 'y' && i > 0 && !isVowelLetter(s[i - 1]))) {
			let toks: string[];
			let adv: number;
			const three = s.slice(i, i + 3);
			if (DIGRAPH3[three]) {
				toks = [DIGRAPH3[three]];
				adv = 3;
			}
			// word-final ⟨ow⟩: keep the GOAT offglide as a consonant /w/ (show → /ʂow/)
			else if (c2 === 'ow' && (i + 2 >= n || s[i + 2] === '-' || s[i + 2] === ' ')) {
				toks = ['o', 'w'];
				adv = 2;
			} else if (DIGRAPH2[c2]) {
				toks = [DIGRAPH2[c2]];
				adv = 2;
			} else {
				// single vowel (+ optional precision mark)
				let mark: 'flip' | 'alt' | null = null;
				adv = 1;
				if (s[i + 1] === DOT) {
					mark = 'flip';
					adv = 2;
				} else if (s[i + 1] === UMAC) {
					mark = 'alt';
					adv = 2;
				}
				let val: string;
				if (mark === 'alt') val = MACRON_ALT[c];
				else if (c === 'a' && prevEmitted() === 'w')
					val = 'a'; // wa → /a/
				else if (c === 'a' && i + adv >= n)
					val = 'a'; // word-final ⟨a⟩ → /a/
				else {
					let long = isLong(s, i);
					if (mark === 'flip') long = !long;
					val = long ? LONG[c] : SHORT[c];
				}
				toks = [val];
			}
			if (s[i + adv] === ACUTE) {
				explicitIdx = out.length;
				adv += 1;
			} // acute marks this vowel
			out.push(...toks);
			i += adv;
			continue;
		}

		// ---- consonants (c/g/j/x/h, n→ŋ, w/y-onset, doubles, singles) ----
		if (c === c2[1] && SINGLE_CONS[c]) {
			out.push(SINGLE_CONS[c]);
			i += 2;
			continue;
		} // doubled → single
		if (c === 'c') {
			out.push(['e', 'i', 'y'].includes(s[i + 1]) ? 'ts' : 'k');
			i += 1;
			continue;
		}
		if (c === 'g') {
			if (s[i + 1] === DOT) {
				out.push('ʐ');
				i += 2;
				continue;
			}
			if (s[i + 1] === UMAC) {
				out.push('ɟ');
				i += 2;
				continue;
			}
			out.push(['e', 'i', 'y'].includes(s[i + 1]) ? 'dʒ' : 'g');
			i += 1;
			continue;
		}
		if (c === 'j') {
			out.push('dʒ');
			i += 1;
			continue;
		}
		if (c === 'x') {
			out.push('k', 's');
			i += 1;
			continue;
		}
		if (c === 'h') {
			if (s[i + 1] === DOT) {
				out.push('ɦ');
				i += 2;
				continue;
			}
			out.push('h');
			i += 1;
			continue;
		}
		if (c === 'n' && ['k', 'g'].includes(s[i + 1])) {
			out.push('ŋ');
			i += 1;
			continue;
		}
		if (c === 'w') {
			out.push('w');
			i += 1;
			continue;
		}
		if (c === 'y') {
			out.push('j');
			i += 1;
			continue;
		} // onset y (start or after vowel handled above)
		if (SINGLE_CONS[c]) {
			out.push(SINGLE_CONS[c]);
			i += 1;
			continue;
		}

		i += 1; // unknown / stray mark
	}

	return placeStress(out, explicitIdx);
}
