'use server';

import { createClient } from '@supabase/supabase-js';

// Use SERVICE_ROLE_KEY for server-side operations (has all permissions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function completeRegistration(
  authUserId: string,
  email: string,
  firstName: string,
  lastName: string
) {
  try {
    // 1. Create company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([
        {
          name: `${firstName} ${lastName}`,
          description: `Empresa personal de ${firstName}`,
          subscription_tier: 'free',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (companyError || !company) {
      console.error('Company creation error:', companyError);
      throw new Error('No se pudo crear la empresa');
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
      throw new Error('No se pudo crear el usuario');
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
      throw new Error('No se pudo crear el rol');
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
      throw new Error('No se pudo asignar el rol');
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
      // Don't throw - statuses might already exist
    }

    return {
      success: true,
      companyId: company.id,
      userId: user.id,
    };
  } catch (error) {
    console.error('Registration completion error:', error);
    throw error;
  }
}

export async function updateLoginTimestamp(authUserId: string) {
  try {
    // 1. Get user from users table
    const { data: user, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (getUserError) {
      console.error('User not found:', getUserError);
      throw new Error('Usuario no encontrado en la base de datos');
    }

    // 2. Update last_login_at
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', authUserId);

    if (updateError) {
      console.error('Error updating login timestamp:', updateError);
      throw new Error('No se pudo actualizar la hora de login');
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Login timestamp update error:', error);
    throw error;
  }
}
