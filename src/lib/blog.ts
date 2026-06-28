import 'server-only';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  keywords: string[];
}

export interface BlogPost extends BlogPostMeta {
  html: string;
}

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function parseFrontmatter(raw: string): { meta: Partial<BlogPostMeta>; body: string } {
  const match = raw.match(/^<!--([\s\S]*?)-->/);
  if (!match) return { meta: {}, body: raw };

  const block = match[1];
  const body = raw.slice(match[0].length).trimStart();
  const meta: Partial<BlogPostMeta> = {};

  const grab = (key: RegExp): string | undefined => {
    const m = block.match(key);
    return m ? m[1].trim() : undefined;
  };

  const slugRaw = grab(/URL slug:\s*(.+)/);
  if (slugRaw) {
    const last = slugRaw.split('/').filter(Boolean).pop();
    if (last) meta.slug = last;
  }
  meta.title = grab(/SEO Title:\s*(.+)/);
  meta.description = grab(/Meta description:\s*(.+)/);
  meta.excerpt = grab(/Excerpt:\s*(.+)/);
  const kw = grab(/Target keywords:\s*(.+)/);
  meta.keywords = kw ? kw.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return { meta, body };
}

export function listBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getBlogPost(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf-8');
  const { meta, body } = parseFrontmatter(raw);
  const html = marked.parse(body, { async: false }) as string;
  return {
    slug: meta.slug || slug,
    title: meta.title || slug,
    description: meta.description || '',
    excerpt: meta.excerpt || meta.description || '',
    keywords: meta.keywords || [],
    html,
  };
}

export function listBlogPosts(): BlogPostMeta[] {
  return listBlogSlugs()
    .map((slug) => {
      const file = path.join(BLOG_DIR, `${slug}.md`);
      const raw = fs.readFileSync(file, 'utf-8');
      const { meta } = parseFrontmatter(raw);
      return {
        slug: meta.slug || slug,
        title: meta.title || slug,
        description: meta.description || '',
        excerpt: meta.excerpt || meta.description || '',
        keywords: meta.keywords || [],
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
