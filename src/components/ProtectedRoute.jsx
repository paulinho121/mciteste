'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkSuperUser } from '../lib/auth'
import { Card, CardContent } from './ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const { isAuthenticated, isSuperUser } = await checkSuperUser()
        
        if (!isAuthenticated || !isSuperUser) {
          // Redirecionar para login se não estiver autenticado ou não for super usuário
          router.push('/login')
          return
        }
        
        setIsAuthorized(true)
      } catch (error) {
        console.error('Erro ao verificar acesso:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Verificando permissões...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Acesso Negado</h2>
            <p className="text-gray-600 text-center">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Redirecionando para o login...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {children}
    </>
  )
}

