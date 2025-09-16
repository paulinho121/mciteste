import { supabase } from './supabase';

// Verificar se o usuário atual é um super usuário
export async function checkSuperUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { isAuthenticated: false, isSuperUser: false, user: null };
    }

    // Verificar se o email está na tabela super_usuarios
    const { data: superUser, error } = await supabase
      .from('super_usuarios')
      .select('*')
      .eq('email', session.user.email)
      .eq('ativo', true)
      .single();

    if (error || !superUser) {
      return { isAuthenticated: true, isSuperUser: false, user: session.user };
    }

    return { 
      isAuthenticated: true, 
      isSuperUser: true, 
      user: session.user,
      superUser: superUser
    };
  } catch (error) {
    console.error('Erro ao verificar super usuário:', error);
    return { isAuthenticated: false, isSuperUser: false, user: null };
  }
}

// Fazer logout
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Erro inesperado ao fazer logout:', error);
    return { success: false, error: 'Erro inesperado' };
  }
}

// Hook para monitorar mudanças de autenticação
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

