// Turning a Sentence into the three parallel lines the page shows.
//
// The Russglish line is not stored anywhere: it IS the token list, rendered
// through the lexicon. That is deliberate — a stored Russglish string could
// drift out of step with the tokens beneath it, and then the highlighting would
// point at the wrong words.

import { lookup } from '$lib/data/texts';
import { offsetOf } from '$lib/data/refs';
import { capitalizeIn, formOf, type Orthography } from '$lib/orthography';
import type { Sentence, Token } from '$lib/data/schema.types';

export type Word = {
	index: number;
	token: Token;
	/** The word in the reader's chosen orthography, capitalized as the sentence requires. */
	form: string;
	neutral: string;
	ipa: string;
	glossEn: string;
	glossRu: string;
	before: string;
	after: string;
};

/** A run of source text, tagged with the token that claims it (or null). */
export type Piece = { text: string; index: number | null };

// A `Sentence` is one line of a text, which may hold more than one actual
// sentence once punctuation gets involved: "Planet — null forma; vakuum. Allah
// phantom woda." So capitalization tracks full stops rather than just the start.
const ENDS_SENTENCE = /[.!?…]["')\]]*\s*$/;

export function words(sentence: Sentence, orthography: Orthography): Word[] {
	let opensSentence = true;
	return sentence.tokens.map((token, index) => {
		const entry = lookup(token.entry);
		const proper = entry.partOfSpeech.includes('proper noun');
		const form = formOf(entry, orthography);
		const capital = opensSentence || proper;
		opensSentence = ENDS_SENTENCE.test(token.after ?? '');
		return {
			index,
			token,
			form: capital ? capitalizeIn(form, orthography) : form,
			neutral: entry.entry,
			ipa: entry.ipa,
			glossEn: entry.glossEn,
			glossRu: entry.glossRu,
			before: token.before ?? '',
			after: token.after ?? ''
		};
	});
}

/**
 * A sentence as one plain Russglish string — for titles in lists, menus and
 * document titles, where there is nowhere to hang the per-word interaction that
 * SentenceView provides.
 */
export function line(sentence: Sentence, orthography: Orthography): string {
	return words(sentence, orthography)
		.map((word) => `${word.before}${word.form}${word.after}`)
		.join(' ');
}

/**
 * Split a source sentence into pieces, each tagged with the token that
 * references it. Refs are validated as resolvable and non-overlapping at load,
 * so a simple left-to-right walk is enough.
 */
export function pieces(sentence: Sentence, side: 'en' | 'ru'): Piece[] {
	const text = side === 'en' ? sentence.enText : sentence.ruText;
	const spans = sentence.tokens
		.map((token, index) => {
			const ref = side === 'en' ? token.refEn : token.refRu;
			const start = offsetOf(text, ref);
			return { start, end: start + ref[0].length, index };
		})
		.sort((a, b) => a.start - b.start);

	const out: Piece[] = [];
	let at = 0;
	for (const span of spans) {
		if (span.start > at) out.push({ text: text.slice(at, span.start), index: null });
		out.push({ text: text.slice(span.start, span.end), index: span.index });
		at = span.end;
	}
	if (at < text.length) out.push({ text: text.slice(at), index: null });
	return out;
}
