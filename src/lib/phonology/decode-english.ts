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

import { placeStress, BETA, DENTAL_T, type Pron } from './ipa.ts';
import { DOT, UMAC, ACUTE, DIAERESIS, COMPOUND } from './marks.ts';

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
// and treating the compound joiner / ' ' as a word end.
function isLong(s: string, i: number): boolean {
	let j = i + 1;
	let cc = 0;
	while (j < s.length) {
		const ch = s[j];
		if (ch === DOT || ch === UMAC || ch === ACUTE || ch === "'") {
			j++;
			continue;
		} // skip marks/stress
		if (ch === COMPOUND || ch === ' ') break; // morpheme boundary = end
		if (CONS_LETTERS.has(ch)) {
			cc++;
			j++;
			continue;
		}
		break; // hit a vowel
	}
	const atEnd = j >= s.length || s[j] === COMPOUND || s[j] === ' ';
	const nextIsVowel = !atEnd && VOWEL_LETTERS.has(s[j]);
	if (cc === 0) return true; // V# or hiatus
	if (cc === 1 && nextIsVowel) return true; // VCV / magic-e → long
	return false; // VC# or VCC… → short
}

export function decodeEnglish(word: string): Pron {
	// compound: each part is its own stress domain (decode separately)
	if (word.includes(COMPOUND)) return word.split(COMPOUND).filter(Boolean).flatMap(decodeEnglish);
	const s = word.toLowerCase();

	// The bare word ⟨y⟩ is /i/, the Spanish value, unconditioned. This is the
	// LETTER standing alone rather than a ⟨y⟩ inside a word, so none of English's
	// own readings apply (my /əi/, gym /ɪ/) and the conjunction needs no mark —
	// which matters because this column's marks go BELOW, and a descender has no
	// room for one.
	if (s === 'y') return ['i'];

	const n = s.length;
	const out: Pron = [];
	let i = 0;
	let explicitIdx: number | null = null;

	const prevEmitted = () => out[out.length - 1];

	while (i < n) {
		const c = s[i];
		const c2 = s.slice(i, i + 2);
		const rest = s.slice(i);

		if (c === COMPOUND || c === ' ' || c === ACUTE) {
			i += 1;
			continue;
		}

		// -tion → /tsiə̃/
		if (rest === 'tion') {
			out.push('ts', 'i', 'ə̃');
			i += 4;
			continue;
		}

		// -sion → /ziə̃/, the same ending one letter over: vision/визия,
		// division/дивизия, revision/ревизия. English says /ʒ/ here and Russian /z/,
		// and there is no compromise phone between them, so the Russian value wins
		// and an English reader's /ʒ/ is simply their accent — the same bargain
		// ⟨-tion⟩ already makes for /ʃ/.
		if (rest === 'sion') {
			out.push('z', 'i', 'ə̃');
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
		if (c === 'b' && s[i + 1] === DOT) {
			out.push(BETA);
			i += 2;
			continue;
		} // ḅ→[b͡β] (Byzantine β, b↔v)
		// s̱ → /z/. English writes a great many /z/ with ⟨s⟩ — visual, music, easy,
		// season, rose — and Russian writes them with ⟨з⟩, so without this the
		// English column would have to respell (⟨vizual⟩) and lose the word. The
		// underdot is already spoken for by [s̺], so /z/ takes the macron.
		// ï → /j/, the consonantal ⟨i⟩ of million, onion, senior, premier. See
		// marks.ts for why this one needs a mark rather than a rule.
		if (c === 'i' && s[i + 1] === DIAERESIS) {
			out.push('j');
			i += 2;
			continue;
		}

		if (c === 's' && s[i + 1] === UMAC) {
			out.push('z');
			i += 2;
			continue;
		}
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
		//
		// ⟨y⟩ counts as that vowel. It is a nucleus everywhere else in this decoder,
		// and magic-e sits behind it in type, style, byte, rhyme and thyme just as it
		// does behind ⟨i⟩ in swine. Leaving it out made ⟨type⟩ read /ˈtəipi/.
		if (
			c === 'e' &&
			i === n - 1 &&
			CONS_LETTERS.has(s[i - 1]) &&
			n > 2 &&
			/[aeiouy]/.test(s.slice(0, i - 1))
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
		// ⟨y⟩ is the consonant /j/ when a vowel FOLLOWS it — yes, canyon, beyond —
		// and a nucleus otherwise: hybrid, my, and the bare word ⟨y̱⟩. The
		// preceding-letter test stays so an offglide after a vowel (boy) is left
		// alone. The old rule keyed only on what came before, which made the ⟨y⟩ of
		// canyon a vowel.
		if (isVowelLetter(c) || (c === 'y' && !isVowelLetter(s[i - 1]) && !isVowelLetter(s[i + 1]))) {
			let toks: string[];
			let adv: number;
			const three = s.slice(i, i + 3);
			if (DIGRAPH3[three]) {
				toks = [DIGRAPH3[three]];
				adv = 3;
			}
			// word-final ⟨ow⟩: keep the GOAT offglide as a consonant /w/ (show → /ʂow/)
			else if (c2 === 'ow' && (i + 2 >= n || s[i + 2] === COMPOUND || s[i + 2] === ' ')) {
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
		// n → ŋ before a velar. ⟨c⟩ counts when it is the /k/ one — before a, o, u or
		// a consonant — and not when it is the /ts/ one, using the same test the ⟨c⟩
		// rule below uses. So ⟨nomenclate⟩ is /ŋ/, matching Russian ⟨нк⟩, while
		// ⟨dance⟩ and ⟨prince⟩ keep their /n/.
		const velarNext =
			['k', 'g'].includes(s[i + 1]) || (s[i + 1] === 'c' && !['e', 'i', 'y'].includes(s[i + 2]));
		if (c === 'n' && velarNext) {
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
