// Russian (Cyrillic) orthography → canonical phonemes, vowels included. Stress
// follows the default rule (placeStress) unless a combining ACUTE marks the
// stressed vowel (the reader columns use the acute; only neutral is typeable).
// Precision marks: ш̣=[s̺] т̣=t̪θ в̣=w х̣=kx г̣=ɟ г̱=ɦ; vowels а̣/е̣=æ и̣=ɪ
// и̱=əi; ў=/w/. Palatalization stripped (ь / iotation softness; /j/ on-glide of
// я/е/ё/ю kept). Unstressed -ер/-ел/-ен → /r l n/.
//
// NO final devoicing. Russian devoices its own final obstruents, but Russglish
// does not inherit the rule: перио́д is /periˈod/, and a Russian reader who says
// [t] there has an accent, not a different word. Devoicing here would cost the
// English column the /d/ of ⟨period⟩ and ⟨hybrid⟩ — a real confusion for an
// English reader — to prevent a Russian confusion that does not arise.

import { placeStress, DENTAL_T, type Pron } from './ipa.ts';
import { DOT, UMAC, ACUTE, COMPOUND } from './marks.ts';

const CONS: Record<string, string> = {
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	ж: 'ʐ',
	з: 'z',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'tʃ',
	ш: 'ʂ',
	щ: 'ʂ',
	й: 'j',
	ў: 'w'
};
const VOW: Record<string, { v: string; iot?: boolean }> = {
	а: { v: 'a' },
	э: { v: 'e' },
	и: { v: 'i' },
	о: { v: 'o' },
	у: { v: 'u' },
	ы: { v: 'ɪ' },
	е: { v: 'e', iot: true },
	ё: { v: 'o', iot: true },
	ю: { v: 'u', iot: true },
	я: { v: 'a', iot: true }
};
const DOT_ALT: Record<string, string> = {
	ш: 's̺',
	т: 't̪θ',
	в: 'w',
	г: 'ɟ',
	х: 'kx',
	д: DENTAL_T,
	а: 'æ',
	е: 'æ',
	и: 'ɪ'
};
const UMAC_ALT: Record<string, string> = { г: 'ɦ', и: 'əi' };

const isVowelChar = (c: string) => c in VOW;

export function decodeRussian(word: string): Pron {
	// compound: each part is its own stress domain (decode separately)
	if (word.includes(COMPOUND)) return word.split(COMPOUND).filter(Boolean).flatMap(decodeRussian);
	const s = word.toLowerCase();
	const n = s.length;
	const out: Pron = [];
	let explicitIdx: number | null = null;

	let i = 0;
	let prevWasVowel = false;
	while (i < n) {
		const c = s[i];
		const rest = s.slice(i);

		if (c === COMPOUND || c === ' ' || c === ACUTE) {
			i += 1;
			prevWasVowel = false;
			continue;
		}

		if (rest === 'ция') {
			out.push('ts', 'i', 'ə̃');
			i += 3;
			prevWasVowel = false;
			continue;
		}
		// -зия, the partner of English -sion (визия, дивизия, ревизия).
		if (rest === 'зия') {
			out.push('z', 'i', 'ə̃');
			i += 3;
			prevWasVowel = false;
			continue;
		}
		if (c === 'д' && s[i + 1] === 'ж') {
			out.push('dʒ');
			i += 2;
			prevWasVowel = false;
			continue;
		}
		if (c === 'е' && ['р', 'л', 'н'].includes(s[i + 1]) && i + 2 === n) {
			i += 1;
			prevWasVowel = false;
			continue;
		}

		// precision marks (+ acute stress on a marked vowel)
		if (s[i + 1] === DOT && DOT_ALT[c]) {
			let adv = 2;
			if (isVowelChar(c) && s[i + 2] === ACUTE) {
				explicitIdx = out.length;
				adv += 1;
			}
			out.push(DOT_ALT[c]);
			i += adv;
			prevWasVowel = isVowelChar(c);
			continue;
		}
		if (s[i + 1] === UMAC && UMAC_ALT[c]) {
			let adv = 2;
			if (isVowelChar(c) && s[i + 2] === ACUTE) {
				explicitIdx = out.length;
				adv += 1;
			}
			out.push(UMAC_ALT[c]);
			i += adv;
			prevWasVowel = isVowelChar(c);
			continue;
		}

		// plain vowels (+ acute stress)
		if (isVowelChar(c)) {
			const { v, iot } = VOW[c];
			if (iot && (i === 0 || prevWasVowel)) out.push('j');
			let adv = 1;
			if (s[i + 1] === ACUTE) {
				explicitIdx = out.length;
				adv += 1;
			}
			out.push(v);
			i += adv;
			prevWasVowel = true;
			continue;
		}

		if (c === 'н' && ['к', 'г'].includes(s[i + 1])) {
			out.push('ŋ');
			i += 1;
			prevWasVowel = false;
			continue;
		}

		if (CONS[c]) {
			if (s[i + 1] === c) {
				out.push(CONS[c]);
				i += 2;
				prevWasVowel = false;
				continue;
			}
			out.push(CONS[c]);
			i += 1;
			prevWasVowel = false;
			continue;
		}

		// A SEPARATING ь/ъ before a vowel is a real /j/ — каньон, статья, объект —
		// not palatalization. Only the palatalizing kind is stripped; the header
		// above already says the /j/ on-glide of я/е/ё/ю is kept, and this is the
		// same sound written the other way round.
		if ((c === 'ь' || c === 'ъ') && isVowelChar(s[i + 1])) {
			out.push('j');
			i += 1;
			prevWasVowel = false;
			continue;
		}

		i += 1; // ь / ъ / stray → skip
	}

	return placeStress(out, explicitIdx);
}
