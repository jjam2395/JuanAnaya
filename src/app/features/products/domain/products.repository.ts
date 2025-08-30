import { InjectionToken } from "@angular/core";
import { Product } from "./product.model";

export interface ProductsRepository {
    list(): Promise <{ data: Product []; total: number}>;
    create(product:Product): Promise <void>;
    update(product:Product): Promise <void>;
    remove(id:string): Promise <void>;
    checkId(id:string): Promise <boolean>;    
}

export const PRODUCTS_REPOSITORY = new InjectionToken<ProductsRepository>('ProductsRepository');