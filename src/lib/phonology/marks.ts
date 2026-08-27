// The ordinal precision-layer combining marks (see orthography.md), as explicit
// codepoints so every module agrees on the exact character.
export const DOT = "̣"; // combining dot below  → "non-default reading" (alt-1)
export const UMAC = "̱"; // combining macron below → alt-2

export const ACUTE = "́"; // combining acute = stress (on the stressed vowel)

// The one mark that goes ABOVE rather than below. English ⟨i⟩ before a vowel is
// regularly the consonant /j/ — million, onion, senior, brilliant, premier — but
// it is a NUCLEUS in dialect, period and ideal, so no blanket rule can tell them
// apart and it takes a mark. A diaeresis already means "read this vowel on its
// own", and marking it also blocks the ⟨ie⟩ digraph, which is what lets ⟨premier⟩
// survive spelled as itself.
export const DIAERESIS = "̈"; // combining diaeresis → consonantal ⟨ï⟩ = /j/

// Convenience for building marked strings in data/tests.
export const dot = (base: string) => base + DOT;
export const umac = (base: string) => base + UMAC;
export const ac = (base: string) => base + ACUTE; // stress mark
