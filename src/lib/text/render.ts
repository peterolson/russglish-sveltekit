// Turning a Sentence into the three parallel lines the page shows.
//
// The Russglish line is not stored anywhere: it IS the phrase list, rendered
// through the lexicon. That is deliberate — a stored Russglish string could
// drift out of step with the tokens beneath it, and then the highlighting would
// point at the wrong words.
//
// Highlighting works on PHRASES, not words, because that is the unit the data
// aligns: pointing at `periód` lights up the whole of "In the beginning",
// because that is the span the word helps render, and no smaller claim is true.

import { lookup } from '$lib/data/texts';
import { offsetOf } from '$lib/data/refs';
import { capitalizeIn, formOf, type Orthography } from '$lib/orthography';
import type { Sentence, Token } from '$lib/data/schema.types';

export type Word = {
	/** Position in the flattened line. */
	index: number;
	/** Which translation unit this word belongs to. */
	phrase: number;
	token: Token;
	/** The word in the reader's chosen orthography, capitalized as the sentence requires. */
	form: string;
	neutral: string;
	ipa: string;
	glossEn: string;
	glossRu: string;
	before: string;
	after: string;
	/** False when this word binds to the next with no space: self·type. */
	space: boolean;
};

/** A run of source text, tagged with the phrase that claims it (or null). */
export type Piece = { text: string; phrase: number | null };

// A `Sentence` is one line of a text, which may hold more than one actual
// sentence once punctuation gets involved: "Planet — null forma; vakuum. Allah
// phantom woda." So capitalization tracks full stops rather than just the start.
const ENDS_SENTENCE = /[.!?…]["')\]]*\s*$/;

// Direct speech opens a sentence too, even where the verb before it ends with no
// stop: Allah declarate «Terra go prodúctate…». Both parents capitalize there.
const OPENS_QUOTE = /[«"'([]$/;

// Russglish has two joiners and they are not the same thing.
//
// The INTERPUNCT of dayn·stá̱rt or tip·top makes a WORD. It is a lexical compound with
// its own entry, and the hyphen is phonologically load-bearing: decodeNeutral
// gives each half its own stress domain, and lexicon.ts checks that the halves
// really do run together into the whole.
//
// The HYPHEN of self-type makes a PHRASE. Several words act as one modifier,
// which head-finality alone leaves ambiguous once three nouns stack up. It is a
// parsing aid only — separate words already have separate stress domains — so
// unlike the hyphen it changes no phonology and earns no lexicon entry. The
// composition stays visible on the page, which is the point: nothing is being
// claimed as a new word.
export const GROUP = '-';

export function words(sentence: Sentence, orthography: Orthography): Word[] {
	const out: Word[] = [];
	let opensSentence = true;

	sentence.phrases.forEach((phrase, phraseIndex) => {
		for (const token of phrase.tokens) {
			const entry = lookup(token.entry);
			const proper = entry.partOfSpeech.includes('proper noun');
			const form = formOf(entry, orthography);
			const capital = opensSentence || proper || OPENS_QUOTE.test(token.before ?? '');
			opensSentence = ENDS_SENTENCE.test(token.after ?? '');
			out.push({
				index: out.length,
				phrase: phraseIndex,
				token,
				form: capital ? capitalizeIn(form, orthography) : form,
				neutral: entry.entry,
				ipa: entry.ipa,
				glossEn: entry.glossEn,
				glossRu: entry.glossRu,
				before: token.before ?? '',
				after: token.after ?? '',
				space: !(token.after ?? '').endsWith(GROUP)
			});
		}
	});

	return out;
}

/**
 * A sentence as one plain Russglish string — for titles in lists, menus and
 * document titles, where there is nowhere to hang the per-word interaction that
 * SentenceView provides.
 */
export function line(sentence: Sentence, orthography: Orthography): string {
	return words(sentence, orthography)
		.map((word) => `${word.before}${word.form}${word.after}${word.space ? ' ' : ''}`)
		.join('')
		.trimEnd();
}

/**
 * Split a source sentence into pieces, each tagged with the phrase that
 * references it. Refs are validated as resolvable and non-overlapping at load,
 * so a simple left-to-right walk is enough.
 */
export function pieces(sentence: Sentence, side: 'en' | 'ru'): Piece[] {
	const text = side === 'en' ? sentence.enText : sentence.ruText;
	const spans = sentence.phrases
		.map((phrase, index) => {
			const ref = side === 'en' ? phrase.refEn : phrase.refRu;
			const start = offsetOf(text, ref);
			return { start, end: start + ref[0].length, phrase: index };
		})
		.sort((a, b) => a.start - b.start);

	const out: Piece[] = [];
	let at = 0;
	for (const span of spans) {
		if (span.start > at) out.push({ text: text.slice(at, span.start), phrase: null });
		out.push({ text: text.slice(span.start, span.end), phrase: span.phrase });
		at = span.end;
	}
	if (at < text.length) out.push({ text: text.slice(at), phrase: null });
	return out;
}
