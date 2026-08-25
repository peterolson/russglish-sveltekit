// Resolving a SourceRef — ["and", 0] — to a place in a source sentence.
//
// The index counts OCCURRENCES, not characters, so that editing a sentence does
// not invalidate every ref after the edit. Almost every ref is occurrence 0; the
// index exists for the sentence that says the same word twice.
//
// Occurrences are counted at WORD BOUNDARIES where the substring has any. That
// matters more than it looks: "и" occurs inside гибридный, диалект and
// английского long before it occurs as the word и, so counting raw substring
// hits would make ["и", 0] silently highlight a letter in the middle of another
// word — a wrong alignment the validator could not tell from a right one. A
// substring that never lands on a boundary (a bare morpheme, say -ёнка) falls
// back to counting every occurrence, so sub-word refs stay addressable.

import type { SourceRef } from './schema.types';

const LETTER = /\p{L}/u;

export function occurrences(text: string, needle: string): number[] {
	if (!needle) return [];
	const all: number[] = [];
	const whole: number[] = [];
	for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1)) {
		all.push(i);
		const before = text[i - 1];
		const after = text[i + needle.length];
		if (!(before && LETTER.test(before)) && !(after && LETTER.test(after))) whole.push(i);
	}
	return whole.length ? whole : all;
}

/** Character offset of a ref, or -1 if the sentence has no such occurrence. */
export function offsetOf(text: string, ref: SourceRef): number {
	return occurrences(text, ref[0])[ref[1]] ?? -1;
}
