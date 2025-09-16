
import { supabase } from '../../../lib/supabase.js';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado.' }), { status: 400 });
    }

    const fileText = await file.text();

    return new Promise((resolve) => {
      Papa.parse(fileText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const produtos = results.data.map(row => ({
            COD: row['COD'],
            "NOME DO PRODUTO": row['NOME DO PRODUTO'],
            MARCA: row['MARCA'],
            CEARÁ: parseInt(row['CEARÁ']) || 0,
            "SANTA CATARINA": parseInt(row['SANTA CATARINA']) || 0,
            "SÃO PAULO": parseInt(row['SÃO PAULO']) || 0,
            TOTAL: parseInt(row['TOTAL']) || 0,
            RESERVA: parseInt(row['RESERVA']) || 0,
          }));

          try {
            // Primeiro, deletar todos os produtos existentes
            const { error: deleteError } = await supabase
              .from('produtos')
              .delete()
              .neq('COD', ''); // Deleta todos os registros (usando uma condição que sempre é verdadeira)

            if (deleteError) {
              console.error('Erro ao deletar produtos existentes:', deleteError);
              resolve(new Response(JSON.stringify({ 
                error: 'Erro ao limpar dados existentes.' 
              }), { status: 500 }));
              return;
            }

            // Depois, inserir todos os novos produtos
            const { data, error: insertError } = await supabase
              .from('produtos')
              .insert(produtos);

            if (insertError) {
              console.error('Erro ao inserir novos produtos:', insertError);
              resolve(new Response(JSON.stringify({ 
                error: 'Erro ao inserir novos dados.' 
              }), { status: 500 }));
              return;
            }

            resolve(new Response(JSON.stringify({
              message: 'Planilha processada com sucesso! Todos os dados foram substituídos.',
              produtos_inseridos: produtos.length,
              produtos_removidos: 'Todos os dados anteriores foram removidos',
            }), { status: 200 }));

          } catch (error) {
            console.error('Erro durante o processamento:', error);
            resolve(new Response(JSON.stringify({ 
              error: 'Erro durante o processamento dos dados.' 
            }), { status: 500 }));
          }
        },
        error: (err) => {
          resolve(new Response(JSON.stringify({ error: `Erro ao analisar CSV: ${err.message}` }), { status: 400 }));
        }
      });
    });
  } catch (error) {
    console.error('Erro geral na API:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}


