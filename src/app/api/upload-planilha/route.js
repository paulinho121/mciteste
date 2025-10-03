import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Papa from 'papaparse';

// --- E-mail autorizado para fazer o upload ---
const EMAIL_AUTORIZADO = 'paulofernandoautomacao@gmail.com';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Validação do Usuário
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado: falha na autenticação.' }), { status: 401 });
  }

  if (user.email !== EMAIL_AUTORIZADO) {
    return new Response(JSON.stringify({ error: 'Acesso negado: você não tem permissão para esta operação.' }), { status: 403 });
  }

  // 2. Processamento do Arquivo
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo foi enviado.' }), { status: 400 });
    }

    const fileText = await file.text();

    // 3. Análise do CSV e atualização do banco de dados
    return new Promise((resolve) => {
      Papa.parse(fileText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: async (results) => {
          if (results.errors.length) {
            return resolve(new Response(JSON.stringify({ error: `Erro ao ler CSV: ${results.errors[0].message}` }), { status: 400 }));
          }

          const produtosDaPlanilha = results.data.map(row => ({
            COD: row['COD'],
            "NOME DO PRODUTO": row['NOME DO PRODUTO'],
            MARCA: row['MARCA'],
            CEARÁ: parseInt(row['CEARÁ']) || 0,
            "SANTA CATARINA": parseInt(row['SANTA CATARINA']) || 0,
            "SÃO PAULO": parseInt(row['SÃO PAULO']) || 0,
            TOTAL: parseInt(row['TOTAL']) || 0,
            RESERVA: parseInt(row['RESERVA']) || 0,
            imagem_url: row['imagem_url'] || null, // Adiciona o campo da imagem
          }));

          const produtosValidos = produtosDaPlanilha.filter(p => p.COD);

          if (produtosValidos.length === 0) {
            return resolve(new Response(JSON.stringify({ error: 'Nenhum produto com COD válido na planilha.' }), { status: 400 }));
          }

          try {
            const { error: upsertError } = await supabase
              .from('produtos')
              .upsert(produtosValidos, { onConflict: 'COD' });

            if (upsertError) {
              console.error('Erro no upsert do Supabase:', upsertError);
              return resolve(new Response(JSON.stringify({ error: `Erro ao salvar no banco: ${upsertError.message}` }), { status: 500 }));
            }

            resolve(new Response(JSON.stringify({
              message: 'Planilha processada com sucesso!',
              produtos_atualizados: produtosValidos.length,
              produtos_inseridos: 'N/A' // O upsert não distingue, simplificando a resposta.
            }), { status: 200 }));

          } catch (dbError) {
            console.error('Erro de banco de dados:', dbError);
            resolve(new Response(JSON.stringify({ error: 'Erro interno no processamento do banco de dados.' }), { status: 500 }));
          }
        },
        error: (err) => {
          resolve(new Response(JSON.stringify({ error: `Erro ao analisar CSV: ${err.message}` }), { status: 400 }));
        }
      });
    });
  } catch (error) {
    console.error('Erro geral na API de upload:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}
