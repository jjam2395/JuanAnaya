import { Routes } from '@angular/router';

export const routes: Routes = [
        { path: 'products', loadChildren: () =>
            import ('./features/products/pages/products.routes')
            .then(m => m.productsRoutes)
        },
];
