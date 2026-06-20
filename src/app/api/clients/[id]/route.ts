import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';
import { UpdateClientSchema } from '@/features/clients/validators/client.validator';
import type { UpdateClientInput } from '@/features/clients/types/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/clients/[id]
 * Obtiene un cliente por ID con validación de permisos
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await context.params;

    // Validar session
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener company_id del usuario
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

    // Obtener cliente y validar que pertenece a la misma company
    const repository = new ClientSupabaseRepository();
    const client = await repository.findById(clientId);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verificar que el cliente pertenece a la company del usuario (multi-tenant)
    if (client.company_id !== userProfile.company_id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this client' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { data: client, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clients/[id]
 * Actualiza un cliente con validación de permisos
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await context.params;

    // Validar session
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener company_id del usuario
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

    // Verificar que el cliente existe y pertenece a la misma company
    const repository = new ClientSupabaseRepository();
    const existingClient = await repository.findById(clientId);

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (existingClient.company_id !== userProfile.company_id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this client' },
        { status: 403 }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validatedData = UpdateClientSchema.parse(body);

    // Actualizar cliente
    const updatedClient = await repository.update(clientId, validatedData);

    return NextResponse.json(
      { data: updatedClient, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error);
    
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

/**
 * DELETE /api/clients/[id]
 * Elimina (soft delete) un cliente con validación de permisos
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await context.params;

    // Validar session
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener company_id del usuario
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

    // Verificar que el cliente existe y pertenece a la misma company
    const repository = new ClientSupabaseRepository();
    const existingClient = await repository.findById(clientId);

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (existingClient.company_id !== userProfile.company_id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this client' },
        { status: 403 }
      );
    }

    // Eliminar cliente (soft delete)
    await repository.delete(clientId);

    return NextResponse.json(
      { success: true, message: 'Client deleted successfully' },
      { status: 204 }
    );
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
