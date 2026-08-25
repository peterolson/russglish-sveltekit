<script lang="ts">
	import TextView from '$lib/components/TextView.svelte';
	import { findText } from '$lib/data/texts';

	// The home page IS a text: the one that explains what Russglish is.
	const intro = findText('russglish');
</script>

<svelte:head>
	<title>Russglish</title>
</svelte:head>

<main class="page">
	{#if intro}
		<TextView text={intro.text} />
	{/if}
</main>
