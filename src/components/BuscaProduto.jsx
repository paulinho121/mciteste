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
      <Card>
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
            <Button onClick={buscarProdutos} disabled={carregando}>
              {carregando ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {erro && (
            <p className="text-red-500 text-sm mt-2">{erro}</p>
          )}
        </CardContent>
      </Card>

      {produtos.length > 0 && (
        <div className="space-y-4">
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
                      <div className="flex justify-between">
                        <span>Ceará:</span>
                        <span className="font-medium">{produto.ceara}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Santa Catarina:</span>
                        <span className="font-medium">{produto.santa_catarina}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>São Paulo:</span>
                        <span className="font-medium">{produto.sao_paulo}</span>
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

