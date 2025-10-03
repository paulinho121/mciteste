import { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { supabase } from '../lib/supabase' // Importa o cliente Supabase

// --- E-mail autorizado para upload ---
const EMAIL_AUTORIZADO = 'paulofernandoautomacao@gmail.com';

export default function UploadPlanilha() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao buscar sessão do usuário:", error);
      } else {
        setUsuario(data.user);
      }
      setVerificandoAcesso(false);
    };
    fetchUser();
  }, []);

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
      const progressInterval = setInterval(() => {
        setProgresso(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/upload-planilha", {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgresso(100)

      const data = await response.json()

      if (response.ok) {
        setResultado(data)
        setArquivo(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        setErro(data.error || 'Erro ao processar planilha')
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor')
    } finally {
      setCarregando(false)
      setTimeout(() => setProgresso(0), 2000)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Se ainda estiver verificando o acesso, mostra um loader
  if (verificandoAcesso) {
      return (
          <Card>
              <CardContent className="p-6 text-center">
                  <p>Verificando permissões...</p>
              </CardContent>
          </Card>
      );
  }

  // Se o usuário não for o autorizado, mostra uma mensagem de bloqueio
  if (usuario?.email !== EMAIL_AUTORIZADO) {
    return (
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Lock className="h-5 w-5" />
                Acesso Restrito
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            A funcionalidade de upload de planilhas é restrita. Por favor, contate o administrador se precisar de acesso.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Se o usuário for autorizado, renderiza o componente de upload
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Planilha de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <div className="space-y-1">
                <p className="font-medium">{resultado.message}</p>
                {resultado.produtos_inseridos > 0 && <p>Produtos inseridos: {resultado.produtos_inseridos}</p>}
                {resultado.produtos_atualizados > 0 && <p>Produtos atualizados: {resultado.produtos_atualizados}</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Arraste e solte o arquivo CSV aqui</p>
          <p className="text-gray-500 mb-4">ou</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={carregando}>
            Selecionar Arquivo
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
        </div>

        {arquivo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(arquivo.size)}</p>
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
            <Progress value={progresso} />
          </div>
        )}

        <Button onClick={uploadPlanilha} disabled={!arquivo || carregando} className="w-full">
          {carregando ? 'Processando...' : 'Fazer Upload e Sincronizar'}
        </Button>

        <div className="text-sm text-gray-500 space-y-1 pt-2">
          <p><strong>Formato esperado:</strong></p>
          <p>• Arquivo CSV com as colunas: COD, NOME DO PRODUTO, MARCA, CEARÁ, SANTA CATARINA, SÃO PAULO, TOTAL, RESERVA, <strong>imagem_url</strong></p>
          <p>• A coluna `imagem_url` deve conter o link direto para a imagem do produto.</p>
        </div>
      </CardContent>
    </Card>
  )
}
