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
	C: 'ch', // /tʃ/
	X: 'sh', // /ʂ/
	Z: 'zh', // /ʐ/
	S: 'ś', // /s̺/
	T: 'th', // /t̪θ/
	D: 'dt', // /t̪/
	K: 'kh', // /kx/
	G: 'ǧ', // /ɟ/
	H: 'gh', // /ɦ/
	// vowels
	a: 'a',
	e: 'e',
	i: 'i',
	o: 'o',
	u: 'u',
	I: 'ı', // /ɪ/ Turkish dotless i
	A: 'æ', // /æ/
	Y: 'ī', // /əi/
	E: 'an' // /ə̃/
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
