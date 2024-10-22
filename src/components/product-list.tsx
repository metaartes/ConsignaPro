import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus, Download, Eye } from 'lucide-react';
import { ProductForm } from '@/components/product-form';
import { Product, Client } from '@/types';
import { SearchFilter } from '@/components/search-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  clients: Client[];
}

export function ProductList({ products, setProducts, clients }: ProductListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const deleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleSearch = (searchTerm: string, filters: string[]) => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = filters.length === 0 || filters.some(filter => {
        switch (filter) {
          case 'inStock':
            return product.inventory > 0;
          case 'outOfStock':
            return product.inventory === 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
    setFilteredProducts(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Código', 'Nombre', 'Precio', 'Inventario', 'Clientes'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => 
        [
          product.code,
          product.name,
          product.price.toFixed(2),
          product.inventory,
          clients.filter(client => client.products.some(p => p.id === product.id))
            .map(client => client.name)
            .join('; ')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'productos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getClientsWithProduct = (productId: number) => {
    return clients.filter(client => client.products.some(p => p.id === productId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchFilter 
          onSearch={handleSearch} 
          filters={[
            { value: 'inStock', label: 'En stock' },
            { value: 'outOfStock', label: 'Sin stock' },
          ]}
        />
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Inventario</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>{getClientsWithProduct(product.id).length} clientes</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedProduct(product)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(showForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={(newProduct) => {
            if (editingProduct) {
              setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : p));
            } else {
              setProducts([...products, { ...newProduct, id: Date.now() }]);
            }
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Producto</DialogTitle>
            </DialogHeader>
            <div>
              <p><strong>Nombre:</strong> {selectedProduct.name}</p>
              <p><strong>Código:</strong> {selectedProduct.code}</p>
              <p><strong>Precio:</strong> ${selectedProduct.price.toFixed(2)}</p>
              <p><strong>Inventario:</strong> {selectedProduct.inventory}</p>
              <h4 className="mt-4 mb-2 font-semibold">Clientes que tienen este producto:</h4>
              <ul>
                {getClientsWithProduct(selectedProduct.id).map((client, index) => (
                  <li key={index}>
                    {client.name} - Cantidad: {client.products.find(p => p.id === selectedProduct.id)?.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}