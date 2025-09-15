import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CadastroProduto() {
  const [produto, setProduto] = useState({
    cod: '',
    nome_do_produto: '',
    marca: '',
    ceara: 0,
    santa_catarina: 0,
    sao_paulo: 0,
    total: 0,
    reserva: 0
  })
  
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('') // 'success' ou 'error'

  const handleInputChange = (campo, valor) => {
    setProduto(prev => ({
      ...prev,
      [campo]: valor
    }))
    
    // Calcula o total automaticamente
    if (['ceara', 'santa_catarina', 'sao_paulo'].includes(campo)) {
      const novosProdutos = { ...produto, [campo]: parseInt(valor) || 0 }
      const novoTotal = novosProdutos.ceara + novosProdutos.santa_catarina + novosProdutos.sao_paulo
      setProduto(prev => ({
        ...prev,
        [campo]: parseInt(valor) || 0,
        total: novoTotal
      }))
    }
  }

  const limparFormulario = () => {
    setProduto({
      cod: '',
      nome_do_produto: '',
      marca: '',
      ceara: 0,
      santa_catarina: 0,
      sao_paulo: 0,
      total: 0,
      reserva: 0
    })
    setMensagem('')
  }

  const cadastrarProduto = async () => {
    if (!produto.cod || !produto.nome_do_produto) {
      setMensagem('Código e nome do produto são obrigatórios')
      setTipoMensagem('error')
      return
    }

    setCarregando(true)
    setMensagem('')
    
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produto)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMensagem('Produto cadastrado com sucesso!')
        setTipoMensagem('success')
        limparFormulario()
      } else {
        setMensagem(data.error || 'Erro ao cadastrar produto')
        setTipoMensagem('error')
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor')
      setTipoMensagem('error')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Cadastrar Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mensagem && (
          <Alert className={tipoMensagem === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertDescription className={tipoMensagem === 'success' ? 'text-green-700' : 'text-red-700'}>
              {mensagem}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cod">Código *</Label>
            <Input
              id="cod"
              type="number"
              placeholder="Ex: 1234"
              value={produto.cod}
              onChange={(e) => handleInputChange('cod', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              placeholder="Ex: Câmera Digital"
              value={produto.nome_do_produto}
              onChange={(e) => handleInputChange('nome_do_produto', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            placeholder="Ex: Sony"
            value={produto.marca}
            onChange={(e) => handleInputChange('marca', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Estoque por Filial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ceara">Ceará</Label>
              <Input
                id="ceara"
                type="number"
                min="0"
                value={produto.ceara}
                onChange={(e) => handleInputChange('ceara', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="santa_catarina">Santa Catarina</Label>
              <Input
                id="santa_catarina"
                type="number"
                min="0"
                value={produto.santa_catarina}
                onChange={(e) => handleInputChange('santa_catarina', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sao_paulo">São Paulo</Label>
              <Input
                id="sao_paulo"
                type="number"
                min="0"
                value={produto.sao_paulo}
                onChange={(e) => handleInputChange('sao_paulo', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total">Total (Calculado Automaticamente)</Label>
            <Input
              id="total"
              type="number"
              value={produto.total}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reserva">Reserva</Label>
            <Input
              id="reserva"
              type="number"
              min="0"
              value={produto.reserva}
              onChange={(e) => handleInputChange('reserva', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={cadastrarProduto} disabled={carregando} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {carregando ? 'Cadastrando...' : 'Cadastrar Produto'}
          </Button>
          <Button variant="outline" onClick={limparFormulario}>
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

