import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus } from 'lucide-react';

export default function CadastroReserva() {
  const [cod, setCod] = useState('');
  const [reserva, setReserva] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastroReserva = async () => {
    if (!cod.trim() || !reserva.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const response = await fetch('/api/reservas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cod, reserva: parseInt(reserva, 10) }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message || 'Reserva cadastrada com sucesso!');
        setCod('');
        setReserva('');
      } else {
        setErro(data.error || 'Erro ao cadastrar reserva.');
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
          Cadastrar Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Código do Produto"
            value={cod}
            onChange={(e) => setCod(e.target.value)}
          />
          <Input
            placeholder="Quantidade a ser reservada"
            type="number"
            value={reserva}
            onChange={(e) => setReserva(e.target.value)}
          />
        </div>
        <Button
          onClick={handleCadastroReserva}
          disabled={carregando}
          className="w-full bg-[#DCDCDC] hover:bg-[#C0C0C0] text-black"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar Reserva'}
        </Button>
        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
        {mensagem && <p className="text-green-500 text-sm mt-2">{mensagem}</p>}
      </CardContent>
    </Card>
  );
}