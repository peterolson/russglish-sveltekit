// 'coincidence' is the claim that English and Russian landed on the same shape
// with no shared history — -ate is Latin -atus, -ать is the inherited Slavic
// infinitive, and their match is luck. That is the OPPOSITE of 'borrowing', so
// the two are mutually exclusive, and a coincidence has no borrowSources to
// name: nothing was borrowed from anywhere. lexicon.ts enforces both.
export type DerivationType =
	'onomatopoeia' | 'borrowing' | 'portmanteau' | 'coincidence' | 'compound' | 'affixation';
export type BorrowSource = 'english' | 'russian' | 'latin' | 'greek' | 'french' | 'pie' | 'arabic';
export type PartOfSpeech =
	| 'noun'
	| 'verb'
	| 'adjective'
	| 'adverb'
	| 'proper noun'
	| 'numeral'
	| 'pronoun'
	| 'preposition'
	| 'conjunction'
	| 'particle'
	| 'interjection';

// Most entries are free words. An affix is a real lexicon entry too — it has to
// be, because it carries its own convergence problem: -ate/-ать only works as a
// suffix if English /eɪt/ and Russian /atʲ/ can meet, and they meet at /æt/.
// Affixes are written with their hyphen in all three columns (-At, -ạte, -а̣ть).
export type MorphemeType = 'word' | 'prefix' | 'suffix';

// A Russglish word can only exist where an English word and a Russian one
// converge, and there is no guarantee that a convergent pair exists for the
// meaning the language needs. "Language" has none — language/язык share nothing.
// So the nearest pair that DOES converge is pressed into the job, and
// dYal'ekt (dialect/диалект) carries the sense "language".
//
// That gap is a fact about the language, not a translation error, and it is
// invisible in a gloss that just reads "language; dialect". This records how far
// the word had to stretch. WHICH sense it stretched to is already the first
// thing the gloss says, so it is not repeated here.
export type SenseRelation =
	| 'near-synonym' // dialect → language; atmosphere → sky
	| 'broadening' // a narrow source term doing wider duty
	| 'narrowing' // the genus standing in for one species: planet → earth
	| 'metonymy'; // the neighbouring thing standing in

export type LexiconEntry = {
	entry: string;
	entryEn: string;
	entryRu: string;
	sourceEn: string;
	sourceRu: string;
	glossEn: string;
	glossRu: string;
	derivationTypes: DerivationType[];
	borrowSources?: BorrowSource[];
	// For an affix this is what it BUILDS, not what it is: -At is ['verb']
	// because it makes verbs.
	partOfSpeech: PartOfSpeech[];
	// Absent means 'word'.
	morphType?: MorphemeType;
	// The entries this one is built from, in order — a root and its affixes.
	// lexicon.ts checks that the parts really do run together into this word's
	// pronunciation, so a derivation cannot claim a shape it does not have.
	derivedFrom?: string[];
	// Present when the Russglish sense is not the source words' sense, because no
	// convergent pair was available for the meaning wanted. The glosses lead with
	// the Russglish sense and keep the source sense after a semicolon.
	senseShift?: SenseRelation;
};

// A reference into a source text: the substring, and WHICH occurrence of it is
// meant — 0 for the first, which is nearly always the answer. The index is there
// for the sentence that uses the same word twice. See ./refs.ts for how it
// resolves (occurrences are counted at word boundaries).
export type SourceRef = [text: string, occurrence: number];

export type Token = {
	entry: string;
	refEn: SourceRef;
	refRu: SourceRef;
	// Literal characters rendered around the token — punctuation, quotes, dashes.
	// They belong to the sentence, not to the lexeme, so they live here rather
	// than being smuggled into an entry.
	before?: string;
	after?: string;
};

export type Sentence = {
	// The number this line carries in its source (a verse number, say). Kept out
	// of enText/ruText so it cannot be mistaken for something a token could
	// reference, and so the two sources can share one numbering.
	label?: string;
	enText: string;
	ruText: string;
	// EMPTY means not translated yet. A scaffolded text is the source sentences
	// with no tokens against them; they get filled in a line at a time, and the
	// page shows which are still waiting.
	tokens: Token[];
};

// One text, as authored in src/lib/data/texts/**.json. `name` and `order` are
// navigation metadata; `name` defaults to the filename, title-cased.
export type Text = {
	name?: string;
	order?: number;
	title: Sentence;
	sentences: Sentence[];
};

// A folder's optional _folder.json, for when the directory name is not the label
// you want, or when alphabetical order is not the reading order.
export type FolderMeta = {
	name?: string;
	order?: number;
};
