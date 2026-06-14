import Link from 'next/link'
import type { Metadata } from 'next'
import Stage from '@/components/Stage'
import BrandMark from '@/components/BrandMark'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Notes from the Field — Coach Fabian',
  description:
    'Plain-English guides for soccer parents — recruiting, pre-game pep talks, highlight videos, and more.',
}

/**
 * Blog index — chronological list, no tags, no search.
 *
 * The blog is a marketing surface that lives at the same domain for SEO
 * (backlinks pass authority to /recruit too). It is intentionally NOT linked
 * from the home page so the product surface stays calm; parents arrive here
 * cold from Pinterest or Google.
 */
export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <Stage>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-[18px] pb-[48px] pt-[50px]">
        <div className="mb-10 flex items-center justify-center">
          <BrandMark />
        </div>

        <header className="mb-8">
          <h1
            className="mb-2 text-[28px] font-black leading-[1.1] text-white"
            style={{ letterSpacing: '-1px' }}
          >
            Notes from the field.
          </h1>
          <p className="text-[13px] font-medium leading-[1.5] text-white/[0.55]">
            Plain-English guides for soccer parents — recruiting, pre-game pep
            talks, highlight videos, and more.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-white/[0.08] bg-white/[0.04] px-[16px] py-[14px] transition-colors hover:bg-white/[0.07]"
              >
                <div className="mb-1 text-[10.5px] font-extrabold uppercase tracking-[1.5px] text-pitch-mint-300/70">
                  {formatDate(post.date)}
                </div>
                <h2 className="mb-1 text-[16px] font-extrabold leading-[1.25] tracking-[-0.3px] text-white">
                  {post.title}
                </h2>
                <p className="text-[12.5px] font-medium leading-[1.5] text-white/[0.6]">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
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
