import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import Papa from 'papaparse';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  }

  const fileContent = await file.text();

  try {
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const data = results.data;
    let produtosAtualizados = 0;

    for (const row of data) {
      const { COD, EM_IMPORTACAO, DATA_PREVISTA } = row;

      if (!COD) {
        console.warn('Linha ignorada: COD não encontrado', row);
        continue; // Ignora linhas sem código
      }

      const { error } = await supabase
        .from('produtos')
        .update({
          em_importacao: parseInt(EM_IMPORTACAO, 10) || 0,
          data_prevista: DATA_PREVISTA || null,
        })
        .eq('cod', COD);

      if (error) {
        console.error(`Erro ao atualizar produto ${COD}:`, error);
      } else {
        produtosAtualizados++;
      }
    }

    return NextResponse.json({
      message: 'Planilha de importação processada com sucesso!',
      produtos_atualizados: produtosAtualizados,
    });
  } catch (error) {
    console.error('Erro ao processar a planilha de importação:', error);
    return NextResponse.json({ error: 'Erro ao processar a planilha' }, { status: 500 });
  }
}
