// The ordinal precision-layer combining marks (see orthography.md), as explicit
// codepoints so every module agrees on the exact character.
export const DOT = "̣"; // combining dot below  → "non-default reading" (alt-1)
export const UMAC = "̱"; // combining macron below → alt-2

export const ACUTE = "́"; // combining acute = stress (on the stressed vowel)

// Convenience for building marked strings in data/tests.
export const dot = (base: string) => base + DOT;
export const umac = (base: string) => base + UMAC;
export const ac = (base: string) => base + ACUTE; // stress mark
