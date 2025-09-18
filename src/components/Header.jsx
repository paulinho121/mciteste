'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { LogOut, User, Settings } from 'lucide-react'
import { checkSuperUser, signOut } from '../lib/auth'
import logo from '../assets/logo.png'

export default function Header() {
  const [user, setUser] = useState(null)
  const [superUser, setSuperUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { user, superUser } = await checkSuperUser()
      setUser(user)
      setSuperUser(superUser)
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    const { success } = await signOut()
    if (success) {
      router.push('/login')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <img 
              src={logo.src} 
              alt="Logo" 
              className="h-10 w-auto object-contain" 
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Sistema de Estoque
              </h1>
              <h1 className="text-lg font-bold text-gray-900 sm:hidden">
                Estoque
              </h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Gestão de Produtos e Inventário
              </p>
            </div>
          </div>

          {/* Menu do Usuário */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Bem-vindo, {superUser?.nome || user.email}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center space-x-2 bg-[#25ccb8] hover:bg-[#1fa99a] text-white">
                    <User className="h-4 w-4 text-[#d3d3d3]" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{superUser?.nome || 'Super Usuário'}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
