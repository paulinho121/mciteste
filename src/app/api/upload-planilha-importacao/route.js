import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import Papa from 'papaparse';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  const fileContent = await file.text();

  try {
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const data = results.data;

    // Validação de Cabeçalho
    const requiredHeaders = ['COD', 'Quantidade', 'data_chegada'];
    const actualHeaders = results.meta.fields;
    if (!requiredHeaders.every(h => actualHeaders.includes(h))) {
        return NextResponse.json({
            error: `Cabeçalho inválido. Certifique-se de que a planilha contém as colunas: ${requiredHeaders.join(', ')}`
        }, { status: 400 });
    }

    let produtosAtualizadosCount = 0;
    let erros = [];
    let codsNaoEncontrados = [];

    for (const row of data) {
      const { COD, Quantidade, data_chegada } = row;

      if (!COD) {
        console.warn('Linha ignorada: COD não encontrado', row);
        continue;
      }
      
      const parsedQuantidade = parseInt(Quantidade, 10);
      if (isNaN(parsedQuantidade)) {
        erros.push(`Produto ${COD}: Quantidade "${Quantidade}" não é um número válido.`);
        continue;
      }

      const { error, count } = await supabase
        .from('produtos')
        .update({
          'QUANTIDADE EM IMPORTAÇÃO': parsedQuantidade,
          'DATA PREVISTA DA REPOSIÇÃO': data_chegada || null,
        })
        .eq('COD', String(COD).trim());

      if (error) {
        console.error(`Erro ao atualizar produto ${COD}:`, error.message);
        erros.push(`Produto ${COD}: ${error.message}`);
      } else {
        if (count === 0) {
          codsNaoEncontrados.push(COD);
        } else {
          produtosAtualizadosCount += count;
        }
      }
    }
    
    let message = `Processamento concluído.`;

    return NextResponse.json({
      message: message,
      produtos_atualizados: produtosAtualizadosCount,
      erros: erros,
      cods_nao_encontrados: codsNaoEncontrados,
    });

  } catch (error) {
    console.error('Erro ao processar a planilha de importação:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a planilha. Verifique o formato do arquivo.' }, { status: 500 });
  }
}
