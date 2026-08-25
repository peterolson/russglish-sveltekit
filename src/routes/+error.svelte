<script lang="ts">
	import { page } from '$app/state';
	import { labels } from '$lib/ui/labels.svelte';

	const t = labels();
</script>

<svelte:head>
	<title>{t.cap('site')} — {page.status}</title>
</svelte:head>

<main class="page">
	<p class="status">{page.status}</p>
	<p class="message ortho">{t('noText')}</p>
	<p class="path"><code>{page.url.pathname}</code></p>
</main>

<style>
	.status {
		margin: 0;
		color: var(--ink-faint);
		font-size: 3rem;
		line-height: 1;
	}

	.message {
		margin: 0.35rem 0 0;
		font-size: 1.25rem;
	}

	.path {
		margin: 0.75rem 0 0;
		color: var(--ink-faint);
		font-size: 0.85rem;
	}

	code {
		font-family: var(--mono);
	}
</style>
