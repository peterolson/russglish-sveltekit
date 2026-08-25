// The neutral orthography is canonical and QWERTY-typeable, which makes it
// CASE-SIGNIFICANT and ugly on the page (rusglIX). This is its reading form:
// one lowercase letter per neutral letter, diacritics rather than digraphs, each
// mark borrowed from a language that already uses it for that sound. Doubled
// letters pass straight through (russglIX → russglıš): this is a transliteration
// of the spelling, and the doubling is spelling flavour the IPA column resolves.
//
//   č š ž ǯ   the Czech/Croatian hushing series — ч ш ж дж
//   c         Slavic c = /ts/ — ц
//   ś         Polish ś, the between-s-and-š sibilant — our s↔ш compromise [s̺]
//   ǧ ǩ ȟ     Sami ǧ/ǩ and Lakota ȟ for the compromise velars ɟ, kx, ɦ
//   ŧ         Northern Sami ŧ = /θ/ — the t↔θ dental affricate [t̪θ]
//   ṭ         the dot-below already used by the English column for the Grimm
//             t↔d stop (ṭ / д̣), kept here so the two agree
//   j         Slavic/Germanic j = /j/ (so /dʒ/ has to take ǯ)
//   ı         Turkish dotless ı = /ɪ/, held apart from ⟨i⟩ = /i/
//   ä         Finnish ä = /æ/
//   ę         Polish/Lithuanian ogonek = nasal — the -tion glide /ə̃/
//   ai        the one digraph, for the one genuine diphthong /əi/
//
// Stress: the neutral `'` (exceptions only — the default is penultimate) becomes
// a combining acute on the stressed vowel, matching the English/Russian columns.
//
// DISPLAY ONLY. Nothing parses this back, so ⟨ai⟩ colliding with a stray /a/+/i/
// sequence costs nothing; decodeNeutral remains the single source of truth.

import { ACUTE } from './marks.ts';

const ROMAN: Record<string, string> = {
	// plain consonants
	p: 'p',
	t: 't',
	k: 'k',
	b: 'b',
	d: 'd',
	g: 'g',
	m: 'm',
	n: 'n',
	s: 's',
	z: 'z',
	f: 'f',
	v: 'v',
	r: 'r',
	l: 'l',
	h: 'h',
	w: 'w',
	y: 'j', // /j/
	j: 'ǯ', // /dʒ/
	c: 'c', // /ts/
	// marked consonants
	C: 'č', // /tʃ/
	X: 'š', // /ʂ/
	Z: 'ž', // /ʐ/
	S: 'ś', // /s̺/
	T: 'ŧ', // /t̪θ/
	D: 'ṭ', // /t̪/
	K: 'ǩ', // /kx/
	G: 'ǧ', // /ɟ/
	H: 'ȟ', // /ɦ/
	// vowels
	a: 'a',
	e: 'e',
	i: 'i',
	o: 'o',
	u: 'u',
	I: 'ı', // /ɪ/ Turkish dotless i
	A: 'ä', // /æ/
	Y: 'ai', // /əi/
	E: 'ę' // /ə̃/
};

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u', 'I', 'A', 'Y', 'E']);

export function romanizeNeutral(neutral: string): string {
	let out = '';
	let stressNext = false;

	for (const ch of neutral) {
		if (ch === "'") {
			stressNext = true; // marks the NEXT vowel, which may be past an onset cluster
			continue;
		}
		if (ch === '-' || ch === ' ') {
			out += ch;
			continue;
		}
		const roman = ROMAN[ch];
		if (!roman) continue; // unknown letter — same silent skip as decodeNeutral
		if (stressNext && VOWEL_LETTERS.has(ch)) {
			// acute on the nucleus (the first element of a diphthong)
			out += roman[0] + ACUTE + roman.slice(1);
			stressNext = false;
			continue;
		}
		out += roman;
	}

	return out;
}
