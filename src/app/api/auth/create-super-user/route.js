import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { email, password, nome } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Primeiro, criar o usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      return new Response(JSON.stringify({ error: 'Erro ao criar usuário: ' + authError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Depois, adicionar o usuário à tabela super_usuarios
    const { data: superUserData, error: superUserError } = await supabase
      .from('super_usuarios')
      .insert([
        {
          email,
          nome: nome || 'Super Usuário',
          ativo: true,
          criado_em: new Date().toISOString()
        }
      ])
      .select();

    if (superUserError) {
      console.error('Erro ao criar super usuário:', superUserError);
      return new Response(JSON.stringify({ error: 'Erro ao criar super usuário: ' + superUserError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Super usuário criado com sucesso!',
      user: authData.user,
      superUser: superUserData[0]
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

