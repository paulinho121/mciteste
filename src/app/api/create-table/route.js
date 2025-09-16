import { supabase } from '../../../lib/supabase.js';

export async function POST(request) {
  try {
    // Tentar inserir um produto de teste para verificar se a tabela existe
    const { data: testData, error: testError } = await supabase
      .from('produtos')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST205') {
      // Tabela não existe, vamos tentar inserir um produto de teste para forçar a criação
      console.log('Tabela não existe. Tentando criar inserindo um produto de teste...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('produtos')
        .insert({
          COD: 'INIT001',
          'NOME DO PRODUTO': 'Produto Inicial',
          MARCA: 'Sistema',
          CEARÁ: 0,
          'SANTA CATARINA': 0,
          'SÃO PAULO': 0,
          TOTAL: 0,
          RESERVA: 0
        });
      
      if (insertError) {
        console.error('Erro ao criar tabela:', insertError);
        return new Response(JSON.stringify({ 
          error: 'Erro ao criar tabela: ' + insertError.message,
          details: insertError
        }), { status: 500 });
      } else {
        return new Response(JSON.stringify({
          message: 'Tabela criada com sucesso! Produto inicial inserido.',
          data: insertData
        }), { status: 200 });
      }
    } else if (testError) {
      console.error('Erro ao verificar tabela:', testError);
      return new Response(JSON.stringify({ 
        error: 'Erro ao verificar tabela: ' + testError.message,
        details: testError
      }), { status: 500 });
    } else {
      return new Response(JSON.stringify({
        message: 'Tabela já existe!',
        count: testData ? testData.length : 0
      }), { status: 200 });
    }
  } catch (error) {
    console.error('Erro geral na API:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor: ' + error.message 
    }), { status: 500 });
  }
}

