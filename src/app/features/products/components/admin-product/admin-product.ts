
import { Component, inject, OnInit, signal } from '@angular/core';
import { AddProduct, ProductFormValue } from '../add-product/add-product';
import { provideProducts } from '../../pages/products.providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsFacade } from '../../application/products.facade';
import { Product } from '../../domain/product.model';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-product',
  imports: [AddProduct, NgIf],
  providers: provideProducts,
  templateUrl: './admin-product.html',
  styleUrl: './admin-product.scss'
})
export class AdminProduct implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  facade = inject(ProductsFacade);
  checkId = (id:string) => this.facade.checkId(id);


  mode: 'create' | 'edit' = (this.route.snapshot.data['mode'] ?? 'create');
  loading = signal(false);
  model = signal<Product | null>(null);

  async ngOnInit() {
    if (this.mode === 'edit') {
      this.loading.set(true);
      const id = this.route.snapshot.paramMap.get('id')!;
      try {
        const product = await this.facade.getById(id);
        if (product) {
          this.model.set(product);
        }
      } finally {
        this.loading.set(false);
      }
    }
  }

  async onSave(value: ProductFormValue) {
    console.log('product...',value);
    if (this.mode === 'create') {
      await this.facade.create(value as Product);
    } else {
      await this.facade.update(value as Product);
    }
    this.router.navigate(['/products']);
  }
}


