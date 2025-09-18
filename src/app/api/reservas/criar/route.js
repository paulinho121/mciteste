
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  const { identificador, reserva } = await request.json();

  if (!identificador || typeof reserva !== 'number') {
    return new Response(JSON.stringify({ error: 'O identificador do produto e a quantidade são obrigatórios.' }), { status: 400 });
  }

  try {
    let produtosEncontrados;
    let fetchError;

    if (/^\d+$/.test(identificador)) {
      const { data, error } = await supabase
        .from('produtos')
        .select('COD, RESERVA')
        .eq('COD', identificador);
      
      produtosEncontrados = data;
      fetchError = error;
    } else {
      const { data, error } = await supabase
        .from('produtos')
        .select('COD, RESERVA')
        .ilike('NOME DO PRODUTO', `%${identificador}%`);
      
      produtosEncontrados = data;
      fetchError = error;
    }

    if (fetchError) {
      console.error('Erro ao buscar o produto:', fetchError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar o produto.' }), { status: 500 });
    }

    if (!produtosEncontrados || produtosEncontrados.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum produto encontrado com o identificador fornecido.' }), { status: 404 });
    }

    if (produtosEncontrados.length > 1) {
      return new Response(JSON.stringify({ error: 'Múltiplos produtos encontrados. Por favor, seja mais específico ou use o código do produto.' }), { status: 400 });
    }

    const produto = produtosEncontrados[0];
    const novaReserva = (produto.RESERVA || 0) + reserva;

    if (novaReserva < 0) {
      return new Response(JSON.stringify({ error: `Não é possível remover a reserva. A reserva atual é de ${produto.RESERVA || 0}.` }), { status: 400 });
    }
    
    const updateData = {
      RESERVA: novaReserva,
    };

    const { error: updateError } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('COD', produto.COD);

    if (updateError) {
      console.error('Erro ao atualizar a reserva no Supabase:', updateError);
      const errorMessage = updateError.message || 'Erro ao atualizar a reserva.';
      return new Response(JSON.stringify({ error: `Erro na atualização: ${errorMessage}` }), { status: 500 });
    }

    const action = reserva > 0 ? 'criada/atualizada' : 'cancelada';
    return new Response(JSON.stringify({ success: true, message: `Reserva ${action} com sucesso!` }), { status: 200 });

  } catch (error) {
    console.error('Erro geral na API de reserva:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}
