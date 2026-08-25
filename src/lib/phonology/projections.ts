// PERCEPTION (ear) projections — for the lexicon-wide INJECTIVITY check
// (principles.md §5), NOT for convergence. Each maps a canonical phoneme to the
// category that monolingual actually *hears* (what the casual reader gets when
// the precision marks are stripped). Two distinct words must not collide under
// either ear.
//
// STUB for v1: filled in with the cases settled so far; extend as needed when we
// build the injectivity check.

import type { Pron, Phoneme } from "./ipa.ts";

// English ear: can't distinguish these compromise phones from a plain neighbour.
const ENGLISH_EAR: Record<string, Phoneme> = {
  "s̺": "s",   // retracted s heard as /s/
  // [t̪θ]→θ, [kx]→k, [ɟ]→dʒ, [ɦ]→h ... (add when injectivity is implemented)
};

// Russian ear: merges what Cyrillic perception can't keep apart.
const RUSSIAN_EAR: Record<string, Phoneme> = {
  "w": "v",   // /w/ and /v/ both heard as в
  // final devoicing, ш/щ, palatalization are handled at decode/inventory level
};

const apply = (p: Pron, m: Record<string, Phoneme>): Pron => p.map((t) => m[t] ?? t);

export const englishEar = (p: Pron): Pron => apply(p, ENGLISH_EAR);
export const russianEar = (p: Pron): Pron => apply(p, RUSSIAN_EAR);
