import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 1. Buscar todos os dados da planilha de importação
    const { data: importacaoData, error: importacaoError } = await supabase
      .from('planilha_importacao')
      .select('COD, Quantidade, data_chegada');

    if (importacaoError) {
      console.error('Erro ao buscar dados da planilha de importação:', importacaoError);
      return NextResponse.json({ message: 'Erro ao buscar dados de importação.' }, { status: 500 });
    }

    if (!importacaoData || importacaoData.length === 0) {
      return NextResponse.json({ message: 'Nenhum dado de importação para sincronizar.' });
    }

    // 2. Agrupar atualizações para fazer em lote (mais eficiente)
    const updates = importacaoData.map(item => {
        // A coluna na tabela `produtos` se chama `QUANTIDADE EM IMPORTAÇÃO` e `DATA PREVISTA DA REPOSIÇÃO`
        return supabase
            .from('produtos')
            .update({
                'QUANTIDADE EM IMPORTAÇÃO': item.Quantidade,
                'DATA PREVISTA DA REPOSIÇÃO': item.data_chegada
            })
            .eq('COD', item.COD);
    });

    // 3. Executar todas as atualizações
    const results = await Promise.all(updates);

    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Erros durante a sincronização:', errors.map(e => e.error.message));
      // Mesmo com erros, alguns podem ter sucesso. Informamos o usuário sobre a falha parcial.
      return NextResponse.json({ message: `Sincronização concluída com ${errors.length} erros.` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sincronização concluída com sucesso!' });

  } catch (error) {
    console.error('Erro fatal na API de sincronização:', error);
    return NextResponse.json({ message: 'Erro interno crítico do servidor.' }, { status: 500 });
  }
}
