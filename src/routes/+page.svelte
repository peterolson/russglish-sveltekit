<script lang="ts">
	import TextView from '$lib/components/TextView.svelte';
	import { findText } from '$lib/data/texts';
	import { labels } from '$lib/ui/labels.svelte';

	const t = labels();

	// The home page IS a text: the one that explains what Russglish is.
	const intro = findText('russglish');
</script>

<svelte:head>
	<title>{t.cap('site')}</title>
</svelte:head>

<main class="page">
	{#if intro}
		<TextView text={intro.text} />
	{/if}
</main>
