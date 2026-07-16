'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase server env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Error desconocido';
  }
}

function buildCompanyName(
  firstName: string,
  lastName: string,
  email: string,
  authUserId: string
) {
  const namePart = [firstName, lastName].filter(Boolean).join(' ').trim();
  const emailPart = email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, '-');
  const uniqueSuffix = authUserId.slice(0, 8);

  if (namePart) {
    return `Empresa de ${namePart} ${uniqueSuffix}`;
  }

  return `Empresa de ${emailPart} ${uniqueSuffix}`;
}

function createRandomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function isCompanyDuplicateError(error: any) {
  const message = error?.message?.toLowerCase() ?? '';
  return (
    message.includes('companies_name_key') ||
    message.includes('companies_slug_key') ||
    message.includes('unique constraint')
  );
}

export type CompleteRegistrationResult =
  | { success: true; companyId: string; userId: string }
  | { success: false; message: string };

export async function completeRegistration(
  authUserId: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<CompleteRegistrationResult> {
  if (!supabaseUrl || !serviceRoleKey) {
    const message = 'Missing Supabase server env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.';
    console.error(message);
    return { success: false, message };
  }

  try {
    // 1. Create company with a friendly name and an auth ID suffix.
    const companyBaseName = buildCompanyName(firstName, lastName, email, authUserId);
    const companyName = companyBaseName;

    const insertCompany = async (name: string) =>
      supabaseAdmin
        .from('companies')
        .insert([
          {
            name,
            description: `Empresa personal de ${companyBaseName}`,
            subscription_tier: 'free',
            is_active: true,
          },
        ])
        .select()
        .single();

    let { data: company, error: companyError } = await insertCompany(companyName);

    if ((companyError || !company) && isCompanyDuplicateError(companyError)) {
      const fallbackName = `${companyName}-${createRandomSuffix()}`;
      const fallbackResult = await insertCompany(fallbackName);
      company = fallbackResult.data;
      companyError = fallbackResult.error;

      if ((companyError || !company) && isCompanyDuplicateError(companyError)) {
        const randomFallbackName = `${companyName}-${createRandomSuffix()}`;
        const randomFallbackResult = await insertCompany(randomFallbackName);
        company = randomFallbackResult.data;
        companyError = randomFallbackResult.error;
      }
    }

    if (companyError || !company) {
      console.error('Company creation error:', companyError);
      return {
        success: false,
        message: `No se pudo crear la empresa: ${companyError?.message ?? 'error desconocido'}`,
      };
    }

    // 2. Create user in users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authUserId,
          company_id: company.id,
          email: email,
          full_name: `${firstName} ${lastName}`,
          auth_provider: 'supabase',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      return {
        success: false,
        message: `No se pudo crear el usuario: ${userError?.message ?? 'error desconocido'}`,
      };
    }

    // 3. Create or get admin role
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .upsert(
        {
          company_id: company.id,
          name: 'admin',
          description: 'Administrador del sistema',
          is_system_role: true,
          permissions: [
            'clients:create',
            'clients:read',
            'clients:update',
            'clients:delete',
            'sales:create',
            'sales:read',
            'sales:update',
            'sales:delete',
            'vehicles:create',
            'vehicles:read',
            'vehicles:update',
            'vehicles:delete',
            'services:create',
            'services:read',
            'services:update',
            'services:delete',
            'users:manage',
            'roles:manage',
            'reports:view',
            'audit:view',
          ],
        },
        { onConflict: 'company_id,name' }
      )
      .select()
      .single();

    if (roleError || !adminRole) {
      console.error('Role creation error:', roleError);
      return {
        success: false,
        message: `No se pudo crear el rol: ${roleError?.message ?? 'error desconocido'}`,
      };
    }

    // 4. Assign admin role to user
    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .insert([
        {
          user_id: user.id,
          role_id: adminRole.id,
          assigned_by: user.id, // User assigns to themselves
        },
      ]);

    if (assignError) {
      console.error('Role assignment error:', assignError);
      return {
        success: false,
        message: `No se pudo asignar el rol: ${assignError?.message ?? 'error desconocido'}`,
      };
    }

    // 5. Create default client statuses
    const { error: statusError } = await supabaseAdmin
      .from('client_status')
      .insert([
        {
          name: 'Nuevo',
          description: 'Cliente recién registrado',
          color_code: '#4CAF50',
          is_default: true,
        },
        {
          name: 'Activo',
          description: 'Cliente con compras recientes',
          color_code: '#2196F3',
          is_default: false,
        },
        {
          name: 'Inactivo',
          description: 'Cliente sin compras hace 60+ días',
          color_code: '#FF9800',
          is_default: false,
        },
        {
          name: 'VIP',
          description: 'Cliente premium de alto valor',
          color_code: '#9C27B0',
          is_default: false,
        },
      ]);

    if (statusError) {
      console.error('Status creation error:', statusError);
    }

    return {
      success: true,
      companyId: company.id,
      userId: user.id,
    };
  } catch (error) {
    console.error('Registration completion error:', error);
    const message = normalizeError(error);
    return { success: false, message: `Error en completeRegistration: ${message}` };
  }
}

export async function updateLoginTimestamp(authUserId: string) {
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Skipping login timestamp update because Supabase admin env vars are missing.');
    return { success: false, skipped: true, reason: 'missing_env' };
  }

  try {
    const { data: user, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (getUserError) {
      console.warn('Login timestamp lookup skipped:', getUserError.message);
      return { success: false, skipped: true, reason: 'lookup_error' };
    }

    if (!user) {
      console.info('No user row found for login timestamp update; continuing without it.');
      return { success: false, skipped: true, reason: 'user_not_found' };
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', authUserId);

    if (updateError) {
      console.warn('Login timestamp update skipped:', updateError.message);
      return { success: false, skipped: true, reason: 'update_error' };
    }

    return {
      success: true,
      skipped: false,
    };
  } catch (error) {
    console.warn('Login timestamp update skipped due to unexpected error:', error);
    return { success: false, skipped: true, reason: 'unexpected_error' };
  }
}
