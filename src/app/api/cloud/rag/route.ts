import { NextResponse } from 'next/server';
import { globalRAGEngine } from '@/lib/ragEngine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (query) {
    const results = globalRAGEngine.search(query, 5);
    return NextResponse.json({ results });
  }

  const runbooks = globalRAGEngine.getRunbooks();
  return NextResponse.json({ runbooks });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, tags, content, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const doc = globalRAGEngine.addRunbook({
      title,
      category: category || 'troubleshooting',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()),
      content,
      author: author || 'Platform Ops Engineer',
    });

    return NextResponse.json({ success: true, runbook: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
