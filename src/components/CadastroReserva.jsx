import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus, PackageMinus } from 'lucide-react';

export default function CadastroReserva() {
  const [identificador, setIdentificador] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleReserva = async (tipo) => {
    if (!identificador.trim() || !quantidade.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    const valorQuantidade = parseInt(quantidade, 10);
    const quantidadeFinal = tipo === 'cancelar' ? -valorQuantidade : valorQuantidade;

    try {
      const response = await fetch('/api/reservas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identificador, reserva: quantidadeFinal }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message || `Reserva ${tipo === 'cancelar' ? 'cancelada' : 'cadastrada'} com sucesso!`);
        setIdentificador('');
        setQuantidade('');
      } else {
        setErro(data.error || `Erro ao ${tipo === 'cancelar' ? 'cancelar' : 'cadastrar'} reserva.`);
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card className="border-[#DCDCDC]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackagePlus className="h-5 w-5" />
          Cadastrar/Cancelar Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Código ou Nome do Produto"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
          />
          <Input
            placeholder="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleReserva('cadastrar')}
            disabled={carregando}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <PackagePlus className="h-4 w-4 mr-2" />
            {carregando ? 'Processando...' : 'Cadastrar Reserva'}
          </Button>
          <Button
            onClick={() => handleReserva('cancelar')}
            disabled={carregando}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PackageMinus className="h-4 w-4 mr-2" />
            {carregando ? 'Processando...' : 'Cancelar Reserva'}
          </Button>
        </div>
        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
        {mensagem && <p className="text-green-500 text-sm mt-2">{mensagem}</p>}
      </CardContent>
    </Card>
  );
}
