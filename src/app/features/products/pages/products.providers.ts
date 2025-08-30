import { Provider } from '@angular/core';
import { HttpProductsRepository } from '../data-access/http-products.repository';
import { ProductsFacade } from '../application/products.facade';
import { PRODUCTS_REPOSITORY } from '../domain/products.repository';
import { HttpClient } from '@angular/common/http';

export const provideProducts: Provider [] =
  [
    ProductsFacade,
    { 
      provide: PRODUCTS_REPOSITORY, 
      useFactory: (http: HttpClient) => new HttpProductsRepository(http),
      deps: [HttpClient],
    },
  ];
