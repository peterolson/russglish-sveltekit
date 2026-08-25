import { error } from '@sveltejs/kit';
import { findText, type TextLeaf } from '$lib/data/texts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const leaf: TextLeaf | undefined = findText(params.path);
	if (!leaf) error(404, `No text at /texts/${params.path}`);
	return { leaf };
};
