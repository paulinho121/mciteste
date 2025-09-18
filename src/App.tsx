'use client';
import { useState } from 'react'
import { Search, Plus, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import BuscaProduto from './components/BuscaProduto'
import CadastroReserva from './components/CadastroReserva' // Importado
import UploadPlanilha from './components/UploadPlanilha'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('busca')

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'white' }}>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="busca" className="flex items-center gap-2 bg-[#DCDCDC]">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Buscar Produtos</span>
                <span className="sm:hidden">Buscar</span>
              </TabsTrigger>
              <TabsTrigger value="reserva" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Cadastrar Reserva</span>
                <span className="sm:hidden">Reserva</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Planilha</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="busca" className="space-y-6">
              <BuscaProduto />
            </TabsContent>

            <TabsContent value="reserva" className="space-y-6">
              <CadastroReserva />
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <UploadPlanilha />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              Sistema de Gestão de Estoque - Desenvolvido para controle de inventário
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
