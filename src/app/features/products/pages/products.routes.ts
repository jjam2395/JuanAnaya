import { Routes } from "@angular/router";
import { ProductsList } from "./products-list/products-list";
import { AdminProduct } from "../components/admin-product/admin-product";

export const productsRoutes: Routes = [
    { 
        path: '', component: 
        ProductsList
    },
    { 
        path: 'add', 
        component: AdminProduct, 
        data: { mode: 'create' } },
    {
        path: ':id/edit',
        component: AdminProduct,
        data: { mode: 'edit' },
    },
]