import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

export default function UploadPlanilha() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setArquivo(file)
        setErro('')
        setResultado(null)
      } else {
        setErro('Por favor, selecione apenas arquivos CSV')
        setArquivo(null)
      }
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setArquivo(file)
        setErro('')
        setResultado(null)
      } else {
        setErro('Por favor, selecione apenas arquivos CSV')
      }
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const uploadPlanilha = async () => {
    if (!arquivo) {
      setErro('Selecione um arquivo CSV')
      return
    }

    setCarregando(true)
    setProgresso(0)
    setErro('')
    setResultado(null)

    const formData = new FormData()
    formData.append('file', arquivo)

    try {
      // Simula progresso
      const progressInterval = setInterval(() => {
        setProgresso(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/produtos/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgresso(100)

      const data = await response.json()

      if (response.ok) {
        setResultado(data)
        setArquivo(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setErro(data.error || 'Erro ao processar planilha')
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor')
    } finally {
      setCarregando(false)
      setTimeout(() => setProgresso(0), 1000)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Planilha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {erro && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {erro}
            </AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <div className="space-y-1">
                <p className="font-medium">{resultado.message}</p>
                <p>Produtos inseridos: {resultado.produtos_inseridos}</p>
                <p>Produtos atualizados: {resultado.produtos_atualizados}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Arraste e solte seu arquivo CSV aqui
          </p>
          <p className="text-gray-500 mb-4">ou</p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={carregando}
          >
            Selecionar Arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {arquivo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(arquivo.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        {carregando && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processando planilha...</span>
              <span>{progresso}%</span>
            </div>
            <Progress value={progresso} className="w-full" />
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={uploadPlanilha}
            disabled={!arquivo || carregando}
            className="w-full"
          >
            {carregando ? 'Processando...' : 'Fazer Upload'}
          </Button>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Formato esperado:</strong></p>
          <p>• Arquivo CSV com as colunas: COD, NOME DO PRODUTO, MARCA, CEARÁ, SANTA CATARINA, SÃO PAULO, TOTAL, RESERVA</p>
          <p>• A primeira linha deve conter os cabeçalhos</p>
          <p>• Produtos existentes serão atualizados, novos produtos serão inseridos</p>
        </div>
      </CardContent>
    </Card>
  )
}

