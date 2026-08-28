// The interface is written IN Russglish, so a label is not a string — it is a
// list of lexicon entries. That is what lets the whole page change orthography at
// once, and it means no interface word can exist without earning its place in
// the lexicon like any other: converging in all three columns, colliding with
// nothing. Almost all of it is the Greek/Latin international stratum, which is
// where the two languages already agree.
//
// The English and Russian glosses, source words and source sentences are NOT
// interface text — they are the reference material the site is about, and they
// stay in their own languages.

import { getContext, setContext } from 'svelte';
import { entryFor } from '$lib/data/lexicon';
import { capitalizeIn, formOf, type Orthography } from '$lib/orthography';

export const UI = {
	site: ['russglIX'],
	texts: ['tekst'],
	lexicon: ["leksik'on"],
	entries: ['leksema'],
	script: ['skrIpt'],
	english: ['inglIX'],
	neutral: ["stand'ard"],
	russian: ['russki'],
	ipa: ["fon'etika"],
	spelling: ['forma'],
	gloss: ['defInIciE'],
	source: ["res'urs"],
	partOfSpeech: ['klAss'],
	derivation: ['derivAciE'],
	borrowedFrom: ['Import'],
	sense: ["sem'antika"],
	builtFrom: ["kompon'ent"],
	suffix: ['suffIks'],
	prefix: ['prefIks'],
	// "no text" — the empty state, and the 404.
	noText: ['null', 'tekst']
} as const satisfies Record<string, readonly string[]>;

export type UiKey = keyof typeof UI;

/** Render one label in the given orthography. */
export function phrase(key: UiKey, orthography: Orthography): string {
	return UI[key]
		.map((word) => {
			const entry = entryFor(word);
			// Unreachable in practice: lexicon.ts would have thrown at load. Falling
			// back to the key keeps a typo from blanking the whole interface.
			return entry ? formOf(entry, orthography) : word;
		})
		.join(' ');
}

const KEY = Symbol('orthography');

export class OrthographyState {
	current = $state<Orthography>('en');

	constructor(initial: Orthography) {
		this.current = initial;
	}

	/**
	 * A cookie rather than localStorage, because the server chooses the
	 * orthography while rendering: anything the client has to read back after
	 * hydration would show one script and then swap to another.
	 */
	choose(next: Orthography, cookieName: string) {
		this.current = next;
		document.cookie = `${cookieName}=${next};path=/;max-age=31536000;samesite=lax`;
	}
}

const SOURCES = Symbol('sources');

/**
 * Whether the source texts are on show. Russglish ALONE by default: the page is
 * meant to be read, and a reader who can see the English sitting under it will
 * read the English instead. The sources are reference, available on request.
 *
 * Not a cookie, unlike the orthography — the server does not need to know, since
 * hidden is what it renders either way and revealing is a client-side act.
 */
export class SourcesState {
	en = $state(false);
	ru = $state(false);
}

export function provideSources(): SourcesState {
	return setContext(SOURCES, new SourcesState());
}

export function useSources(): SourcesState {
	return getContext<SourcesState>(SOURCES);
}

export function provideOrthography(initial: Orthography): OrthographyState {
	return setContext(KEY, new OrthographyState(initial));
}

export function useOrthography(): OrthographyState {
	return getContext<OrthographyState>(KEY);
}

/**
 * Call once during component setup; the returned function reads the reactive
 * orthography, so labels re-render when it changes. `.cap` capitalizes for the
 * places that want a heading rather than a word — a no-op in IPA, which has no
 * capitals.
 */
export function labels(): ((key: UiKey) => string) & { cap: (key: UiKey) => string } {
	const state = useOrthography();
	const t = (key: UiKey) => phrase(key, state.current);
	return Object.assign(t, {
		cap: (key: UiKey) => capitalizeIn(phrase(key, state.current), state.current)
	});
}
