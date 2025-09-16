
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabaseUrl = 'https://acwcvqwsvcygmxxqhung.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd2N2cXdzdmN5Z214eHFodW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTc1NDEsImV4cCI6MjA3MzI5MzU0MX0.uP1bW15K9qVprm_pXhunGzawmpasYQ1Jbcsyk5LJYjc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

          let produtos_inseridos = 0;
          let produtos_atualizados = 0;

          for (const produto of produtos) {
            const { data: existingProduct, error: fetchError } = await supabase
              .from('produtos')
              .select('COD')
              .eq('COD', produto.COD)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
              console.error('Erro ao buscar produto existente:', fetchError);
              continue;
            }

            if (existingProduct) {
              // Produto existe, atualizar
              const { error: updateError } = await supabase
                .from('produtos')
                .update(produto)
                .eq('COD', produto.COD);

              if (updateError) {
                console.error('Erro ao atualizar produto:', updateError);
              } else {
                produtos_atualizados++;
              }
            } else {
              // Produto não existe, inserir
              const { error: insertError } = await supabase
                .from('produtos')
                .insert(produto);

              if (insertError) {
                console.error('Erro ao inserir produto:', insertError);
              } else {
                produtos_inseridos++;
              }
            }
          }

          resolve(new Response(JSON.stringify({
            message: 'Planilha processada com sucesso!',
            produtos_inseridos,
            produtos_atualizados,
          }), { status: 200 }));
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


