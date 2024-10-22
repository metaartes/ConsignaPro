import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { ClientList } from '@/components/client-list';
import { ProductList } from '@/components/product-list';
import { BalanceManagement } from '@/components/balance-management';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard } from 'lucide-react';
import { loadClients, loadProducts, saveClients, saveProducts } from '@/lib/storage';
import { Client, Product } from '@/types';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setClients(loadClients());
    setProducts(loadProducts());
  }, []);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <h1 className="text-2xl font-bold">NewPet&Fish Consignaciones</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="container py-8">
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="balance">Saldos</TabsTrigger>
            </TabsList>
            <TabsContent value="clients">
              <ClientList clients={clients} setClients={setClients} products={products} />
            </TabsContent>
            <TabsContent value="products">
              <ProductList products={products} setProducts={setProducts} clients={clients} />
            </TabsContent>
            <TabsContent value="balance">
              <BalanceManagement clients={clients} setClients={setClients} products={products} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;