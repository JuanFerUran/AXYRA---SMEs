import { NextRequest, NextResponse } from 'next/server';
import { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';

const repo = new ClientSupabaseRepository();

export async function GET() {
  try {
    const clients = await repo.findAll();
    return NextResponse.json(clients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await repo.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
