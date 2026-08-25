export type DerivationType =
	'onomatopoeia' | 'borrowing' | 'portmanteau' | 'coincidence' | 'compound';
export type BorrowSource = 'english' | 'russian' | 'latin' | 'greek' | 'french' | 'pie' | 'arabic';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'proper noun';

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
	partOfSpeech: PartOfSpeech[];
};

export type Token = {
	entry: string;
	refEn: [string, number];
	refRu: [string, number];
};

export type Sentence = {
	enText: string;
	ruText: string;
	tokens: Token[];
};

export type Text = {
	title: Sentence;
	sentences: Sentence[];
};
