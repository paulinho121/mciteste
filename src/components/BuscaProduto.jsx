import { useState } from 'react'
import { Search, Package, MapPin, Loader2, Image as ImageIcon } from 'lucide-react' // Importa o ícone de imagem
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
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Search className="h-6 w-6" />
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
              className="flex-1 text-base"
            />
            <Button
              onClick={buscarProdutos}
              disabled={carregando}
              variant="secondary"
            >
              {carregando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</> : 'Buscar'}
            </Button>
          </div>
          {erro && (
            <p className="text-red-500 text-sm mt-2">{erro}</p>
          )}
        </CardContent>
      </Card>

      {produtos.length > 0 && (
        <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h3 className="text-xl font-semibold">Resultados da Busca</h3>
          {produtos.map((produto) => (
            <Card key={produto.cod} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* Alterado para 4 colunas */}
                  
                  {/* Coluna da Imagem */}
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                    {produto.imagem_url ? (
                      <img src={produto.imagem_url} alt={`Imagem de ${produto.nome_do_produto}`} className="w-full h-auto object-contain rounded-md" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Coluna de Informações do Produto */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-base">Código: {produto.cod}</span>
                    </div>
                    <h4 className="font-bold text-xl">{produto.nome_do_produto}</h4>
                    {produto.marca && (
                      <Badge variant="secondary">{produto.marca}</Badge>
                    )}
                  </div>
                  
                  {/* Coluna de Estoque */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Estoque por Filial
                    </h5>
                    <div className="space-y-2 text-base">
                      <div className="flex justify-between items-center p-2 rounded-md bg-orange-50 border-l-4 border-orange-400">
                        <span className="text-orange-800 font-medium">Ceará:</span>
                        <span className="font-bold text-lg text-orange-700">{produto.ceara}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-blue-50 border-l-4 border-blue-400">
                        <span className="text-blue-800 font-medium">Santa Catarina:</span>
                        <span className="font-bold text-lg text-blue-700">{produto.santa_catarina}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-purple-50 border-l-4 border-purple-400">
                        <span className="text-purple-800 font-medium">São Paulo:</span>
                        <span className="font-bold text-lg text-purple-700">{produto.sao_paulo}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna de Totais */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-lg">Totais e Importação</h5>
                    <div className="space-y-2 text-base">
                      <div className="flex justify-between">
                        <span>Total Geral:</span>
                        <span className="font-bold text-green-600 text-lg">{produto.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserva:</span>
                        <span className="font-bold text-orange-600 text-lg">{produto.reserva || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disponível:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {produto.total - (produto.reserva || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-semibold">Em importação:</span>
                        <span className="font-bold text-blue-800 text-lg">{produto.quantidade_em_importacao || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Previsão Reposição:</span>
                        <span className="font-medium text-gray-700">{produto.data_prevista_reposicao || 'N/A'}</span>
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
