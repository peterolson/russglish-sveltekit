import {
	isOrthography,
	preferredOrthography,
	ORTHOGRAPHY_COOKIE,
	type Orthography
} from '$lib/orthography';
import type { LayoutServerLoad } from './$types';

// Decided on the server so the first paint is already in the right script. A
// saved choice wins; otherwise the browser's own language picks the column.
export const load: LayoutServerLoad = ({ cookies, request }) => {
	const saved = cookies.get(ORTHOGRAPHY_COOKIE);
	const orthography: Orthography = isOrthography(saved)
		? saved
		: preferredOrthography(request.headers.get('accept-language'));

	return { orthography };
};
