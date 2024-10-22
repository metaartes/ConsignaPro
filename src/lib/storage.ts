import { Client, Product } from '@/types';

export function loadClients(): Client[] {
  const clientsData = localStorage.getItem('clients');
  return clientsData ? JSON.parse(clientsData) : [];
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem('clients', JSON.stringify(clients));
}

export function loadProducts(): Product[] {
  const productsData = localStorage.getItem('products');
  return productsData ? JSON.parse(productsData) : [];
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem('products', JSON.stringify(products));
}