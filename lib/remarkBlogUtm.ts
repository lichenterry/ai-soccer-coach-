/**
 * Rewrites internal CTA links in blog markdown to carry blog UTM params.
 * Links to /coach, /analyze, /recruit (and their sub-paths) get
 * ?utm_source=blog&utm_medium=organic&utm_campaign=<post-slug>
 * appended at render time, so the markdown source stays clean and every
 * post automatically inherits per-post attribution. See PostHog dashboard
 * for the corresponding $entry_utm_* breakdowns.
 */
const INTERNAL_PATHS = ['/coach', '/analyze', '/recruit']

function isInternalCta(url: string): boolean {
  return INTERNAL_PATHS.some(
    (p) =>
      url === p ||
      url.startsWith(`${p}/`) ||
      url.startsWith(`${p}?`) ||
      url.startsWith(`${p}#`)
  )
}

function annotate(url: string, slug: string): string {
  const hashIdx = url.indexOf('#')
  const base = hashIdx === -1 ? url : url.slice(0, hashIdx)
  const hash = hashIdx === -1 ? '' : url.slice(hashIdx)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}utm_source=blog&utm_medium=organic&utm_campaign=${slug}${hash}`
}

type Node = { type?: string; url?: string; children?: Node[] }

function walk(node: Node, slug: string): void {
  if (node.type === 'link' && typeof node.url === 'string' && isInternalCta(node.url)) {
    node.url = annotate(node.url, slug)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, slug)
  }
}

export default function remarkBlogUtm(options: { slug: string }) {
  return (tree: Node) => walk(tree, options.slug)
}
