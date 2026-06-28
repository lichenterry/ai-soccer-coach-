import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Stage from '@/components/Stage'
import BrandMark from '@/components/BrandMark'
import { getAllSlugs, getPost } from '@/lib/blog'
import remarkBlogUtm from '@/lib/remarkBlogUtm'

interface Params {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug)
  if (!post) return { title: 'Not found' }
  return {
    title: `${post.title} — Coach Fabian`,
    description: post.description,
  }
}

/**
 * Blog post page. Markdown rendered via react-markdown + remark-gfm (tables,
 * task lists). Tailwind Typography handles the prose styling with prose-invert
 * for dark backgrounds; we override the accent + link colors to the mint
 * palette so prose feels native to the Coach Fabian system.
 *
 * Wider max-width (max-w-2xl) than the rest of the app because long-form
 * reading needs more horizontal room than the mobile-first product surfaces.
 */
export default function BlogPostPage({ params }: Params) {
  const post = getPost(params.slug)
  if (!post) notFound()

  return (
    <Stage>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-[18px] pb-[64px] pt-[50px]">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/blog"
            aria-label="Back to blog"
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[14px] text-white/70 hover:bg-white/[0.1]"
          >
            ‹
          </Link>
          <BrandMark />
          <span className="h-[30px] w-[30px]" aria-hidden="true" />
        </div>

        <article className="flex flex-col">
          <div className="mb-2 text-[10.5px] font-extrabold uppercase tracking-[1.5px] text-pitch-mint-300/70">
            {formatDate(post.date)}
          </div>
          <h1
            className="mb-6 text-[28px] font-black leading-[1.12] text-white"
            style={{ letterSpacing: '-1px' }}
          >
            {post.title}
          </h1>

          <div
            className="
              prose prose-invert max-w-none
              prose-p:text-[14px] prose-p:leading-[1.7] prose-p:text-white/[0.82]
              prose-headings:font-extrabold prose-headings:tracking-[-0.5px] prose-headings:text-white
              prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-[20px]
              prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[16px]
              prose-a:text-pitch-mint-300 prose-a:no-underline hover:prose-a:text-pitch-mint-100
              prose-strong:text-white
              prose-blockquote:border-l-pitch-mint-300/40 prose-blockquote:bg-white/[0.03] prose-blockquote:py-[2px] prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-white/[0.85]
              prose-li:text-[14px] prose-li:leading-[1.65] prose-li:text-white/[0.82]
              prose-hr:border-white/[0.08]
              prose-table:text-[13px]
              prose-th:text-white
              prose-td:text-white/[0.82] prose-td:align-top
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm, [remarkBlogUtm, { slug: post.slug }]]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </Stage>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
