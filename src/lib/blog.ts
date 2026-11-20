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
  /** ISO date (YYYY-MM-DD), from frontmatter. Falls back to dateModified, then undefined. */
  datePublished?: string;
  dateModified?: string;
}

export interface BlogPost extends BlogPostMeta {
  html: string;
  /** Words in the article body (markdown, minus syntax) — for schema wordCount. */
  wordCount: number;
}

/** "3. Match the metal & stone" → "match-the-metal-stone" */
function headingSlug(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase()
    .replace(/^\s*\d+[.)]\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Give every h2/h3 a stable, unique id so agents and readers can deep-link
 * to a section (/blog/x#choose-the-right-length). marked v18 adds none.
 */
function addHeadingIds(html: string): string {
  const used = new Set<string>();
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const base = headingSlug(inner) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

function countWords(markdown: string): number {
  const text = markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ');
  return text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
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
  meta.datePublished = grab(/Published:\s*(.+)/);
  meta.dateModified = grab(/Updated:\s*(.+)/) || meta.datePublished;

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
  const html = addHeadingIds(marked.parse(body, { async: false }) as string);
  return {
    slug: meta.slug || slug,
    title: meta.title || slug,
    description: meta.description || '',
    excerpt: meta.excerpt || meta.description || '',
    keywords: meta.keywords || [],
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    html,
    wordCount: countWords(body),
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
        datePublished: meta.datePublished,
        dateModified: meta.dateModified,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
