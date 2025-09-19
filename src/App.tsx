'use client';
import { useState } from 'react'
import { Search, Plus, Upload, ShoppingCart, Package } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import BuscaProduto from './components/BuscaProduto.jsx'
import CadastroReserva from './components/CadastroReserva.jsx'
import UploadPlanilha from './components/UploadPlanilha.jsx'
import UploadImportacao from './components/UploadImportacao.jsx' // Corrigido
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Header from './components/Header.jsx'
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
              <TabsTrigger value="busca" className="flex items-center gap-2">
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
                <span className="hidden sm:inline">Upload de Dados</span>
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
              <Tabs defaultValue="estoque" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="estoque" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Atualizar Estoque
                  </TabsTrigger>
                  <TabsTrigger value="importacao" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Atualizar Importação
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="estoque" className="mt-6">
                  <UploadPlanilha />
                </TabsContent>
                <TabsContent value="importacao" className="mt-6">
                  <UploadImportacao />
                </TabsContent>
              </Tabs>
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
