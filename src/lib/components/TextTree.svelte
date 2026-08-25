<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TextNode } from '$lib/data/texts';

	type Props = { nodes: TextNode[] };
	let { nodes }: Props = $props();
</script>

<!-- Recursive by way of a self-calling snippet: the corpus nests arbitrarily
     deeply (Bible → Genesis → Genesis 1), so nothing here may assume a depth. -->
{#snippet branch(items: TextNode[])}
	<ul>
		{#each items as node (node.segments.join('/'))}
			<li>
				{#if node.kind === 'folder'}
					<span class="folder">{node.name}</span>
					{@render branch(node.children)}
				{:else}
					<a href={resolve('/texts/[...path]', { path: node.segments.join('/') })}>{node.name}</a>
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
		text-decoration-color: var(--rule);
		text-underline-offset: 0.15em;
	}

	a:hover {
		text-decoration-color: currentcolor;
	}
</style>
