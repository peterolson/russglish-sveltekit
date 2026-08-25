<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TextNode } from '$lib/data/texts';
	import { line } from '$lib/text/render';
	import { useOrthography } from '$lib/ui/labels.svelte';

	type Props = { nodes: TextNode[] };
	let { nodes }: Props = $props();

	const orthography = useOrthography();
</script>

<!-- Recursive by way of a self-calling snippet: the corpus nests arbitrarily
     deeply (Bible → Genesis → Genesis 1), so nothing here may assume a depth.

     A text is listed by its own Russglish title, in the reader's orthography —
     the corpus is in the language, so its table of contents should be too. The
     authored name (Genesis 1) stays as the tooltip, since a title taken from the
     incipit does not always say which chapter it is. Folder labels are the
     corpus's own, and are left alone. -->
{#snippet branch(items: TextNode[])}
	<ul>
		{#each items as node (node.segments.join('/'))}
			<li>
				{#if node.kind === 'folder'}
					<span class="folder">{node.name}</span>
					{@render branch(node.children)}
				{:else}
					<a
						class="ortho"
						title={node.name}
						href={resolve('/texts/[...path]', { path: node.segments.join('/') })}
					>
						{line(node.text.title, orthography.current)}
					</a>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{@render branch(nodes)}

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Nested lists step in; the rule makes the nesting readable at any depth. */
	li > ul {
		margin-top: 0.35rem;
		padding-left: 1rem;
		border-left: 1px solid var(--rule-faint);
	}

	li {
		padding-block: 0.3rem;
	}

	.folder {
		color: var(--ink-faint);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	a {
		color: var(--ink);
		font-size: 1.05rem;
		text-decoration-color: var(--rule);
		text-underline-offset: 0.15em;
	}

	a:hover {
		text-decoration-color: currentcolor;
	}
</style>
