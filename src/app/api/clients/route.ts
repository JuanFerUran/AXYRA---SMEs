import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';
import { CreateClientSchema, ClientFiltersSchema } from '@/features/clients/validators/client.validator';
import type { ClientFilters } from '@/features/clients/types/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/clients
 * Lista clientes con filtros opcionales y autenticación
 * Query params: search, status_id, is_active, min_lifetime_value, max_lifetime_value, country, sort_by, sort_order, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    // Validar session y obtener company_id
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () =>
          request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          })),
        setAll: () => {},
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No valid session' },
        { status: 401 }
      );
    }

    // Obtener company_id desde metadata del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parsear y validar query params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      search: searchParams.get('search') || undefined,
      status_id: searchParams.get('status_id') || undefined,
      is_active: searchParams.get('is_active') || undefined,
      min_lifetime_value: searchParams.get('min_lifetime_value') || undefined,
      max_lifetime_value: searchParams.get('max_lifetime_value') || undefined,
      country: searchParams.get('country') || undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_order: searchParams.get('sort_order') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const validatedFilters = ClientFiltersSchema.parse(queryParams);

    // Ejecutar query con el repositorio
    const repository = new ClientSupabaseRepository();
    const filters: ClientFilters = {
      ...validatedFilters,
      company_id: userProfile.company_id,
      limit: validatedFilters.limit || 50,
      offset: validatedFilters.offset || 0,
    };

    const clients = await repository.findAll(filters);

    return NextResponse.json(
      { data: clients, total: clients.length, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/clients error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Crea un nuevo cliente con validación server-side
 */
export async function POST(request: NextRequest) {
  try {
    // Validar session y obtener company_id
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () =>
          request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          })),
        setAll: () => {},
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No valid session' },
        { status: 401 }
      );
    }

    // Obtener company_id desde metadata del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parsear body
    const body = await request.json();

    // Validar contra schema (company_id se asegura en el servidor)
    const validatedData = CreateClientSchema.parse({
      ...body,
      company_id: userProfile.company_id,
    });

    // Crear cliente
    const repository = new ClientSupabaseRepository();
    const newClient = await repository.create(validatedData);

    return NextResponse.json(
      { data: newClient, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/clients error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
