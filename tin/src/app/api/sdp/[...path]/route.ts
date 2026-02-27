import { NextRequest, NextResponse } from 'next/server';

const SDP_ORIGIN = process.env.SDP_INTERNAL_URL ?? 'http://34.26.113.151:3000';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${SDP_ORIGIN}/${path.join('/')}`;
  const res = await fetch(url, { signal: req.signal });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'text/plain' },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${SDP_ORIGIN}/${path.join('/')}`;
  const body = await req.text();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: req.signal,
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}
