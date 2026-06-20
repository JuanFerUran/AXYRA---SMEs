import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export async function POST(request: NextRequest) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Require an internal secret header to prevent arbitrary external calls
    const internalSecret = request.headers.get('x-internal-secret') || '';
    const expectedSecret = process.env.INTERNAL_API_KEY || '';
    if (!expectedSecret || internalSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, email, first_name = null, last_name = null, role = 'admin' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const payload: Record<string, any> = {
      id: userId,
      email: email ?? null,
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      role,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('profiles').upsert(payload).select();

    if (error) {
      console.error('create-profile error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true }, { status: 200 });
  } catch (err) {
    console.error('POST /api/auth/create-profile error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
