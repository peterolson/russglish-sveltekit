// The corpus. Texts live as JSON under ./texts/, and the FOLDER STRUCTURE IS THE
// DATA: a file at texts/bible/genesis/genesis-1.json is the text "Genesis 1"
// inside "Genesis" inside "Bible", at /texts/bible/genesis/genesis-1. Nesting is
// arbitrary. A folder may carry a _folder.json to override its label or its
// position; without one, the directory name is title-cased and folders sort
// alphabetically after the ordered ones.
//
// Everything here is checked at module load, the same way lexicon.ts checks
// convergence: a token naming a word that is not in the lexicon, a ref asking
// for an occurrence the sentence does not have, or two tokens claiming
// overlapping stretches of the same source sentence are all build-time errors,
// because a silently wrong alignment is invisible on the page.
//
// The grammar these texts are written in is documented in ./grammar.md.

import { entryFor } from './lexicon';
import type { DecodedEntry } from './lexicon';
import { occurrences } from './refs';
import type { FolderMeta, Sentence, SourceRef, Text } from './schema.types';

export type TextNode = TextLeaf | TextFolder;

export type TextLeaf = {
	kind: 'text';
	slug: string;
	name: string;
	order: number;
	segments: string[];
	text: Text;
};

export type TextFolder = {
	kind: 'folder';
	slug: string;
	name: string;
	order: number;
	segments: string[];
	children: TextNode[];
};

/** "genesis-1" → "Genesis 1", the label for anything that names no other. */
function titleCase(slug: string): string {
	return slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
		.join(' ');
}

type Span = { start: number; end: number; label: string };

function checkRef(
	where: string,
	label: string,
	side: string,
	text: string,
	ref: SourceRef,
	taken: Span[]
) {
	const [needle, occurrence] = ref;
	if (!needle) throw new Error(`${where}: ${label} has an empty ${side} reference`);
	const found = occurrences(text, needle);
	const start = found[occurrence];
	if (start === undefined) {
		const has = found.length === 1 ? 'it occurs once' : `it occurs ${found.length} times`;
		throw new Error(
			`${where}: ${label} wants occurrence ${occurrence} of ${side} "${needle}", but ` +
				`${found.length ? has : 'it does not occur in the sentence'}: "${text}"`
		);
	}
	const end = start + needle.length;
	const clash = taken.find((s) => start < s.end && s.start < end);
	if (clash) {
		throw new Error(
			`${where}: ${label} and ${clash.label} both claim ${side} characters ` +
				`${Math.max(start, clash.start)}–${Math.min(end, clash.end)} of "${text}"`
		);
	}
	taken.push({ start, end, label });
}

function checkSentence(where: string, sentence: Sentence): void {
	const takenEn: Span[] = [];
	const takenRu: Span[] = [];
	for (const phrase of sentence.phrases) {
		if (!phrase.tokens.length) {
			throw new Error(`${where}: a phrase claiming "${phrase.refEn[0]}" has no words`);
		}
		for (const token of phrase.tokens) {
			if (!entryFor(token.entry)) {
				throw new Error(`${where}: token "${token.entry}" is not in the lexicon`);
			}
		}
		// Named by its words, since a phrase has no single entry to blame.
		const label = phrase.tokens.map((token) => token.entry).join(' + ');
		checkRef(where, label, 'English', sentence.enText, phrase.refEn, takenEn);
		checkRef(where, label, 'Russian', sentence.ruText, phrase.refRu, takenRu);
	}
}

// eager: the corpus is small, static, and validated at load — there is nothing
// to gain from deferring it, and a lazy import would defer the errors too.
const textModules = import.meta.glob<{ default: Text }>('./texts/**/*.json', { eager: true });
const folderModules = import.meta.glob<{ default: FolderMeta }>('./texts/**/_folder.json', {
	eager: true
});

const folderMeta = new Map<string, FolderMeta>(
	Object.entries(folderModules).map(([path, mod]) => [
		// './texts/bible/_folder.json' → 'bible'
		path.slice('./texts/'.length, -'/_folder.json'.length),
		mod.default
	])
);

type MutableFolder = TextFolder & { children: TextNode[] };

function makeFolder(segments: string[]): MutableFolder {
	const slug = segments[segments.length - 1] ?? '';
	const meta = folderMeta.get(segments.join('/')) ?? {};
	return {
		kind: 'folder',
		slug,
		name: meta.name ?? titleCase(slug),
		order: meta.order ?? Number.MAX_SAFE_INTEGER,
		segments,
		children: []
	};
}

const root = makeFolder([]);
const folders = new Map<string, MutableFolder>([['', root]]);

function folderAt(segments: string[]): MutableFolder {
	const key = segments.join('/');
	const existing = folders.get(key);
	if (existing) return existing;
	const folder = makeFolder(segments);
	folders.set(key, folder);
	folderAt(segments.slice(0, -1)).children.push(folder);
	return folder;
}

const leaves: TextLeaf[] = [];

for (const [path, mod] of Object.entries(textModules)) {
	const segments = path.slice('./texts/'.length, -'.json'.length).split('/');
	const slug = segments[segments.length - 1];
	if (slug === '_folder') continue;

	const text = mod.default;
	const where = path;
	checkSentence(`${where} (title)`, text.title);
	text.sentences.forEach((sentence, i) => checkSentence(`${where} (sentence ${i + 1})`, sentence));

	const leaf: TextLeaf = {
		kind: 'text',
		slug,
		name: text.name ?? titleCase(slug),
		order: text.order ?? Number.MAX_SAFE_INTEGER,
		segments,
		text
	};
	leaves.push(leaf);
	folderAt(segments.slice(0, -1)).children.push(leaf);
}

// Explicit `order` first, then alphabetical by label; folders and texts sort
// together, so a chapter list stays in reading order alongside its sub-books.
function sortTree(node: MutableFolder): void {
	node.children.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
	for (const child of node.children) if (child.kind === 'folder') sortTree(child);
}
sortTree(root);

export const textTree: TextNode[] = root.children;

/** Every text, flattened — for search, counts, and prerender entries. */
export const allTexts: TextLeaf[] = leaves;

const byPath = new Map(leaves.map((leaf) => [leaf.segments.join('/'), leaf]));

export function findText(path: string | string[]): TextLeaf | undefined {
	return byPath.get(Array.isArray(path) ? path.join('/') : path);
}

/** The folder labels enclosing a text, outermost first — for breadcrumbs. */
export function crumbs(segments: string[]): string[] {
	const out: string[] = [];
	let level: TextNode[] = textTree;
	for (const slug of segments.slice(0, -1)) {
		const folder = level.find(
			(node): node is TextFolder => node.kind === 'folder' && node.slug === slug
		);
		if (!folder) break;
		out.push(folder.name);
		level = folder.children;
	}
	return out;
}

export function lookup(entry: string): DecodedEntry {
	const found = entryFor(entry);
	if (!found) throw new Error(`no lexicon entry "${entry}"`);
	return found;
}
