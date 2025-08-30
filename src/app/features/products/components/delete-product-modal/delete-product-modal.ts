import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-product-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './delete-product-modal.html',
  styleUrl: './delete-product-modal.scss'
})
export class DeleteProductModal {

  @Input() open = false;
  @Input() message = '¿Estás seguro?';

  @Output() confirm = new EventEmitter<void>();
  @Output() canceling = new EventEmitter<void>();

}
