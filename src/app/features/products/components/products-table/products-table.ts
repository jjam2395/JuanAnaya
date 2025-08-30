import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Product } from '../../domain/product.model';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-products-table',
  imports: [NgFor, DatePipe, NgIf],
  templateUrl: './products-table.html',
  styleUrl: './products-table.scss'
})
export class ProductsTable {

  @Input() items: Product []=[];
  @Input() pageSize = 5;
  @Input() results = 5;
  @Input() loading = true;
  @Input() debouncing = true;
  @Output() sizeChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<{ id: string; name: string }>();

  openMenuId: string | null = null;


  onSize(event:Event){
    const input = event.target as HTMLInputElement;
    console.log('emit:', input.value)
    this.sizeChange.emit(input.value);
  }

   toggleMenu(id: string) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  onEdit(id: string) {
    this.openMenuId = null;
    this.edit.emit(id);
  }

  onDelete(product: Product) {
    this.openMenuId = null;
    this.remove.emit({ id: product.id, name: product.name });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const inKebab = target.closest('.products__actions');
    if (!inKebab) this.openMenuId = null;
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.openMenuId = null; }

}
