import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProduct } from './admin-product';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AdminProduct', () => {
  let component: AdminProduct;
  let fixture: ComponentFixture<AdminProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProduct],
      providers:[provideRouter([]), provideHttpClient(withInterceptorsFromDi())],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
