import { supabase } from '../../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const termo = searchParams.get('termo');

  if (!termo) {
    return new Response(JSON.stringify({ error: 'Termo de busca não fornecido.' }), { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .or(`COD.ilike.%${termo}%,"NOME DO PRODUTO".ilike.%${termo}%`);

    if (error) {
      console.error('Erro ao buscar produtos no Supabase:', error);
      return new Response(JSON.stringify({ error: 'Erro ao buscar produtos.' }), { status: 500 });
    }

    // Normalizar nomes das chaves para camelCase para consistência com o frontend
    const produtosNormalizados = data.map(produto => ({
      cod: produto.COD,
      nome_do_produto: produto['NOME DO PRODUTO'],
      marca: produto.MARCA,
      ceara: produto.CEARÁ,
      santa_catarina: produto['SANTA CATARINA'],
      sao_paulo: produto['SÃO PAULO'],
      total: produto.TOTAL,
      reserva: produto.RESERVA,
    }));

    return new Response(JSON.stringify(produtosNormalizados), { status: 200 });
  } catch (error) {
    console.error('Erro geral na API de busca:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}


