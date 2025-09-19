import { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync-importacao', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sucesso!", {
          description: data.message || "Sincronização concluída com sucesso!",
        });
      } else {
        throw new Error(data.message || 'Falha na sincronização.');
      }
    } catch (error) {
      toast.error("Erro de Sincronização", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Sincronizando...' : 'Sincronizar Planilha'}
    </Button>
  );
}
