import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    // Tentar criar a tabela inserindo um registro de teste
    const { data, error } = await supabase
      .from('super_usuarios')
      .insert([
        {
          email: 'test@example.com',
          nome: 'Teste',
          ativo: true,
          criado_em: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao criar tabela super_usuarios:', error);
      
      // Se a tabela não existe, retornar instruções SQL
      if (error.code === 'PGRST205' || error.message.includes("table") || error.message.includes("relation")) {
        const sqlInstructions = `
-- Execute este SQL no painel do Supabase para criar a tabela super_usuarios:

CREATE TABLE IF NOT EXISTS public.super_usuarios (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para email
CREATE INDEX IF NOT EXISTS idx_super_usuarios_email ON public.super_usuarios(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.super_usuarios ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura e escrita
CREATE POLICY "Permitir todas as operações para super_usuarios" ON public.super_usuarios
FOR ALL USING (true) WITH CHECK (true);

-- Garantir que a tabela seja acessível via API
GRANT ALL ON public.super_usuarios TO anon;
GRANT ALL ON public.super_usuarios TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE super_usuarios_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE super_usuarios_id_seq TO authenticated;
        `;

        return new Response(JSON.stringify({ 
          error: 'Tabela super_usuarios não existe.',
          sql: sqlInstructions.trim(),
          message: 'Execute o SQL fornecido no painel do Supabase para criar a tabela.'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Erro ao acessar tabela: ' + error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Se chegou aqui, a tabela existe. Remover o registro de teste
    await supabase
      .from('super_usuarios')
      .delete()
      .eq('email', 'test@example.com');

    return new Response(JSON.stringify({ 
      message: 'Tabela super_usuarios já existe e está funcionando corretamente!'
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

