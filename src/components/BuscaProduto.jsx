import { useState } from 'react'
import { Search, Package, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BuscaProduto() {
  const [termoBusca, setTermoBusca] = useState('')
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const buscarProdutos = async () => {
    if (!termoBusca.trim()) {
      setErro('Digite um termo para buscar')
      return
    }

    setCarregando(true)
    setErro('')
    
    try {
      const response = await fetch(`/api/produtos/buscar?termo=${encodeURIComponent(termoBusca)}`)
      const data = await response.json()
      
      if (response.ok) {
        setProdutos(data)
        if (data.length === 0) {
          setErro('Nenhum produto encontrado')
        }
      } else {
        setErro(data.error || 'Erro ao buscar produtos')
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor')
    } finally {
      setCarregando(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarProdutos()
    }
  }

  return (
  <div className="space-y-6">
      <Card className="border-[#DCDCDC]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código ou nome do produto..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={buscarProdutos}
              disabled={carregando}
              className="bg-[#DCDCDC] hover:bg-[#C0C0C0] text-black"
            >
              {carregando ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {erro && (
            <p className="text-red-500 text-sm mt-2">{erro}</p>
          )}
        </CardContent>
      </Card>

      {produtos.length > 0 && (
        <div className="space-y-4 bg-[#DCDCDC] p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Resultados da Busca</h3>
          {produtos.map((produto) => (
            <Card key={produto.cod} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">Código: {produto.cod}</span>
                    </div>
                    <h4 className="font-medium text-lg">{produto.nome_do_produto}</h4>
                    {produto.marca && (
                      <Badge variant="outline">{produto.marca}</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Estoque por Filial
                    </h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center p-2 rounded-md bg-orange-50 border-l-4 border-orange-400">
                        <span className="text-orange-800 font-medium">Ceará:</span>
                        <span className="font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">{produto.ceara}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-blue-50 border-l-4 border-blue-400">
                        <span className="text-blue-800 font-medium">Santa Catarina:</span>
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">{produto.santa_catarina}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-purple-50 border-l-4 border-purple-400">
                        <span className="text-purple-800 font-medium">São Paulo:</span>
                        <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">{produto.sao_paulo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">Totais</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Geral:</span>
                        <span className="font-bold text-green-600">{produto.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserva:</span>
                        <span className="font-medium text-orange-600">{produto.reserva}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disponível:</span>
                        <span className="font-bold text-blue-600">
                          {produto.total - produto.reserva}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Em importação:</span>
                        <span className="font-medium text-gray-600">{produto.quantidade_em_importacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data prevista da reposição:</span>
                        <span className="font-medium text-gray-600">{produto.data_prevista_reposicao}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
