import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProductsFacade } from '../../application/products.facade';
import { provideProducts } from '../products.providers';
import { InputSearch } from "../../components/input-search/input-search";
import { ProductsTable } from "../../components/products-table/products-table";
import { Router, RouterLink } from '@angular/router';
import { DeleteProductModal } from "../../components/delete-product-modal/delete-product-modal";

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [NgIf, InputSearch, ProductsTable, RouterLink, DeleteProductModal],
  providers: provideProducts,
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss'
})
export class ProductsList implements OnInit {
  private router = inject(Router);
  debouncing = false;
  facade = inject(ProductsFacade);
  showAddProductModal = false;
  pendingToDelete: { id: string; name: string } | null = null;

  ngOnInit() { 
    this.facade.load(); 
  }
  onSearch(q: string) { 
    this.facade.search(q); 
  }
  onSize(v: string) { 
    this.facade.setPageSize(+v); 
  }
  onDebouncingChange(state: boolean) {
    this.debouncing = state;
  }
  goEdit(id: string) { this.router.navigate(['/products/'+id+'/edit']); }

  async confirmDelete(payload: { id: string; name: string }) {
    this.pendingToDelete = payload;
    this.confirmOpen.set(true);
  }

  loading = signal(false);
  confirmOpen = signal(false);
  pendingDeleteId: string | null = null;

async doDelete() {
  if (!this.pendingToDelete) return;
  await this.facade.remove(this.pendingToDelete.id);
  this.pendingToDelete = null;
  this.confirmOpen.set(false);
}

  cancelDelete() {
    console.log('canceling...');
    this.pendingDeleteId = null;
    this.confirmOpen.set(false);
  }

}
