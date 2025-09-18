import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  const { cod, reserva } = await request.json();

  if (!cod || !reserva) {
    return new Response(JSON.stringify({ error: 'Código do produto e quantidade são obrigatórios.' }), { status: 400 });
  }

  if (typeof reserva !== 'number' || reserva <= 0) {
    return new Response(JSON.stringify({ error: 'A quantidade da reserva deve ser um número positivo.' }), { status: 400 });
  }

  try {
    // Primeiro, buscar o produto para obter a reserva atual
    const { data: produtoAtual, error: fetchError } = await supabase
      .from('produtos')
      .select('RESERVA')
      .eq('COD', cod)
      .single();

    if (fetchError || !produtoAtual) {
      console.error('Erro ao buscar produto ou produto não encontrado:', fetchError);
      return new Response(JSON.stringify({ error: 'Produto não encontrado.' }), { status: 404 });
    }

    // Calcular a nova quantidade da reserva
    const novaReserva = (produtoAtual.RESERVA || 0) + reserva;

    // Atualizar o produto com a nova quantidade da reserva
    const { error: updateError } = await supabase
      .from('produtos')
      .update({ RESERVA: novaReserva })
      .eq('COD', cod);

    if (updateError) {
      console.error('Erro ao atualizar a reserva no Supabase:', updateError);
      return new Response(JSON.stringify({ error: 'Erro ao atualizar a reserva.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Reserva atualizada com sucesso!' }), { status: 200 });

  } catch (error) {
    console.error('Erro geral na API de criação de reserva:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}
