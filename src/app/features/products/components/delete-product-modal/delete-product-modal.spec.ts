import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteProductModal } from './delete-product-modal';

describe('DeleteProductModal', () => {
  let component: DeleteProductModal;
  let fixture: ComponentFixture<DeleteProductModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteProductModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteProductModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
