// The neutral orthography: canonical, QWERTY-typeable, no digraphs — every
// phoneme is a single CASE-SENSITIVE letter. Stress follows the default rule
// (penultimate; ə̃ doesn't count, so -tion words are antepenult) UNLESS a
// typeable apostrophe `'` precedes the stressed vowel (exceptions only).
//
//   lowercase: p t k b d g m n s z f v r l h w   y=/j/  j=dʒ  c=ts
//   vowels:    a e i o u   I=ɪ A=æ Y=əi E=ə̃
//   cap cons:  G=ɟ S=[s̺] C=tʃ(ч) Z=ʐ(ж) X=ʂ(ш) T=t̪θ K=kx H=ɦ D=t̪ B=b͡β
//   ŋ positional: n before a velar (k/g)
//   doubled consonant = one phoneme (ss = /s/), for spelling flavour only

import { isConsonant, placeStress, BETA, DENTAL_T, type Pron } from "./ipa.ts";
import { COMPOUND } from "./marks.ts";

const SINGLES: Record<string, string> = {
  p: "p", t: "t", k: "k", b: "b", d: "d", g: "g",
  m: "m", n: "n", s: "s", z: "z", f: "f", v: "v", r: "r", l: "l", h: "h", w: "w",
  y: "j", j: "dʒ", c: "ts",
  a: "a", e: "e", i: "i", o: "o", u: "u",
  I: "ɪ", A: "æ", Y: "əi", E: "ə̃",
  G: "ɟ", S: "s̺", C: "tʃ", Z: "ʐ", X: "ʂ", T: "t̪θ", K: "kx", H: "ɦ", D: DENTAL_T, B: BETA,
};

const VELARS = new Set(["k", "g"]);

export function decodeNeutral(neutral: string): Pron {
  // compound: each part is its own stress domain (decode separately)
  if (neutral.includes(COMPOUND))
    return neutral.split(COMPOUND).filter(Boolean).flatMap(decodeNeutral);
  const s = neutral;
  const raw: Pron = [];
  let stressNext = false;
  let explicitIdx: number | null = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") { stressNext = true; continue; }
    if (ch === COMPOUND || ch === " ") continue;
    const tok = SINGLES[ch];
    if (!tok) continue;
    // A doubled letter is ONE phoneme (russglIX = /ˈrusglɪʂ/). Both reader
    // orthographies already collapse doubles, so neutral has to as well or the
    // columns can never converge on a word spelled with one. Consonants only:
    // a doubled VOWEL is hiatus — two nuclei, which changes the stress count.
    if (isConsonant(tok)) { while (s[i + 1] === ch) i++; }
    if (!isConsonant(tok) && stressNext) { explicitIdx = raw.length; stressNext = false; }
    raw.push(tok);
  }
  const seg = raw.map((t, k) => (t === "n" && VELARS.has(raw[k + 1]) ? "ŋ" : t));
  return placeStress(seg, explicitIdx);
}
