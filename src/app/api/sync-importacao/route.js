import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 1. Buscar todos os dados da planilha de importação
    const { data: importacaoData, error: importacaoError } = await supabase
      .from('planilha_importacao')
      .select('COD, quantidade, data_chegada');

    if (importacaoError) {
      console.error('Erro ao buscar dados da planilha de importação:', importacaoError);
      return NextResponse.json({ message: 'Erro ao buscar dados de importação.' }, { status: 500 });
    }

    if (!importacaoData || importacaoData.length === 0) {
      return NextResponse.json({ message: 'Nenhum dado de importação para sincronizar.' });
    }

    // 2. Agrupar atualizações para fazer em lote
    const updates = importacaoData.map(item => {
      const quantidade = parseInt(item.quantidade, 10) || 0;

      // CONVERSÃO: Garante que o COD seja tratado como texto para a busca
      const codAsString = String(item.COD);

      return supabase
        .from('produtos')
        .update({
          'QUANTIDADE EM IMPORTAÇÃO': quantidade,
          'DATA PREVISÃO DE CHEGADA': item.data_chegada
        })
        .eq('COD', codAsString); // Usa o COD como string na comparação
    });

    // 3. Executar todas as atualizações
    const results = await Promise.all(updates);

    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Erros durante a sincronização:', errors.map(e => e.error.message));
      return NextResponse.json({ message: `Sincronização concluída com ${errors.length} erros.` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sincronização com a planilha de importação concluída com sucesso!' });

  } catch (error) {
    console.error('Erro inesperado na função de sincronização:', error);
    return NextResponse.json({ message: 'Erro inesperado no servidor.' }, { status: 500 });
  }
}
