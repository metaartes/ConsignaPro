import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ClientForm } from '@/components/client-form';
import { Client, Product } from '@/types';
import { SearchFilter } from '@/components/search-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClientListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  products: Product[];
}

export function ClientList({ clients, setClients, products }: ClientListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const deleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const calculateTotal = (clientProducts: Client['products']) => {
    return clientProducts.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleSearch = (searchTerm: string, filters: string[]) => {
    const filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = filters.length === 0 || filters.some(filter => {
        switch (filter) {
          case 'hasBalance':
            return calculateTotal(client.products) > 0;
          case 'noBalance':
            return calculateTotal(client.products) === 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
    setFilteredClients(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Código', 'Saldo Total', 'Productos'];
    const csvContent = [
      headers.join(','),
      ...filteredClients.map(client => 
        [
          client.name,
          client.code,
          calculateTotal(client.products).toFixed(2),
          client.products.map(p => `${p.name} (${p.quantity})`).join('; ')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'clientes.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchFilter 
          onSearch={handleSearch} 
          filters={[
            { value: 'hasBalance', label: 'Con saldo' },
            { value: 'noBalance', label: 'Sin saldo' },
          ]}
        />
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
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
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Saldo Total</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.code}</TableCell>
                <TableCell>${calculateTotal(client.products).toFixed(2)}</TableCell>
                <TableCell>{client.products.length} productos</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/client/${client.id}`)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedClient(client)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteClient(client.id)}
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
      {(showForm || editingClient) && (
        <ClientForm
          client={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onSave={(newClient) => {
            if (editingClient) {
              setClients(clients.map(c => c.id === editingClient.id ? { ...newClient, id: editingClient.id } : c));
            } else {
              setClients([...clients, { ...newClient, id: Date.now(), products: [] }]);
            }
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
            </DialogHeader>
            <div>
              <p><strong>Nombre:</strong> {selectedClient.name}</p>
              <p><strong>Código:</strong> {selectedClient.code}</p>
              <p><strong>Saldo Total:</strong> ${calculateTotal(selectedClient.products).toFixed(2)}</p>
              <h4 className="mt-4 mb-2 font-semibold">Productos:</h4>
              <ul>
                {selectedClient.products.map((product, index) => (
                  <li key={index}>
                    {product.name} - Cantidad: {product.quantity} - Precio: ${product.price.toFixed(2)}
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