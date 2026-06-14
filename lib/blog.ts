import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  return files
    .map((file) => readPost(file.replace(/\.md$/, '')))
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPost(slug: string): BlogPost | null {
  try {
    return readPost(slug)
  } catch {
    return null
  }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

function readPost(slug: string): BlogPost {
  const file = path.join(BLOG_DIR, `${slug}.md`)
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date: String(data.date ?? ''),
    content,
  }
}
