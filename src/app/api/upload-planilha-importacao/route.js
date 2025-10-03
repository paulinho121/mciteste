import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
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
      transformHeader: header => header.toLowerCase().trim(),
    });

    const data = results.data;

    const requiredHeaders = ['cod', 'quantidade', 'data_chegada'];
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
      const COD = row['cod'];
      const Quantidade = row['quantidade'];
      const data_chegada = row['data_chegada'];

      if (!COD) {
        console.warn('Linha ignorada: COD não encontrado', row);
        continue;
      }
      
      const parsedQuantidade = parseInt(Quantidade, 10);
      if (isNaN(parsedQuantidade)) {
        erros.push(`Produto ${COD}: Quantidade "${Quantidade}" não é um número válido.`);
        continue;
      }

      const { data: updatedData, error, count } = await supabase
        .from('produtos')
        .update({
          'QUANTIDADE EM IMPORTAÇÃO': parsedQuantidade,
          'DATA PREVISÃO DE CHEGADA': data_chegada || null,
        })
        .eq('COD', String(COD).trim())
        .select();

      if (error) {
        console.error(`Erro ao atualizar produto ${COD}:`, error.message);
        erros.push(`Produto ${COD}: ${error.message}`);
      } else {
        if (updatedData && updatedData.length > 0) {
          produtosAtualizadosCount++;
        } else {
          codsNaoEncontrados.push(COD);
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
