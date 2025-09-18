import { supabase } from '../../../../lib/supabase';

export async function POST() {
  try {
    const agora = new Date();
    const tempoExpiracao = new Date(agora.getTime() - 168 * 60 * 60 * 1000); // 168 horas atrás

    // Busca todas as reservas que foram criadas antes do tempo de expiração e que ainda possuem reserva
    const { data: reservasExpiradas, error: fetchError } = await supabase
      .from('produtos')
      .select('COD')
      .lt('reserva_criada_em', tempoExpiracao.toISOString())
      .gt('RESERVA', 0);

    if (fetchError) {
      console.error('Erro ao buscar reservas expiradas:', fetchError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar reservas expiradas.' }), { status: 500 });
    }

    if (reservasExpiradas && reservasExpiradas.length > 0) {
      const codigosProdutos = reservasExpiradas.map(p => p.COD);
      
      // Zera a reserva para os produtos com reservas expiradas
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ RESERVA: 0 })
        .in('COD', codigosProdutos);

      if (updateError) {
        console.error('Erro ao limpar reservas expiradas:', updateError);
        return new Response(JSON.stringify({ error: 'Erro ao limpar reservas expiradas.' }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Limpeza de reservas expiradas concluída com sucesso!' }), { status: 200 });

  } catch (error) {
    console.error('Erro geral na API de limpeza de reservas:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}
