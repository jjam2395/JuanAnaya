import { firstValueFrom } from "rxjs";
import { Product } from "../domain/product.model";
import { ProductsRepository } from "../domain/products.repository";
import { HttpClient, HttpHeaders } from "@angular/common/http";


export interface ProductDto {
  id: string; 
  name: string; 
  description: string; 
  logo: string;
  date_release: string; 
  date_revision: string;
};

export interface updateProductDto {
  name: string; 
  description: string; 
  logo: string;
  date_release: string; 
  date_revision: string;
};

export interface ListParamsDto {
    q?: string;
}

export interface ListResponseDto {
    data: ProductDto[];
}

export class HttpProductsRepository implements ProductsRepository {
  private base = '/bp/products';

  constructor(private http: HttpClient) {}

  async list() {
    const res = await firstValueFrom(
      this.http.get<ListResponseDto>(this.base)
    );

    const data: Product[] = (res.data ?? []).map(data => ({
      id: data.id,
      name: data.name,
      description: data.description,
      logo: data.logo,
      date_release: data.date_release,
      date_revision: data.date_revision,
    }));

    const total = data.length;
    return { data, total };
  }

  async create(_product: Product): Promise<void> { 

    const body: ProductDto = {
        id: _product.id,
        name: _product.name,
        description: _product.description,
        logo: _product.logo,
        date_release:_product.date_release,
        date_revision:_product.date_revision,
    };
    const headers = new HttpHeaders({'Content-type': 'application/json'});

    await firstValueFrom(this.http.post<{message:  string; data?: ProductDto}>(this.base, body, {headers}));

   }
  async update(_product: Product): Promise<void> {

    const body: updateProductDto = {
        name: _product.name,
        description: _product.description,
        logo: _product.logo,
        date_release:_product.date_release,
        date_revision:_product.date_revision,
    };
    console.log('product updating...',_product);
    const url = `${this.base}/${encodeURIComponent(_product.id)}`;
    const headers = new HttpHeaders({'Content-type': 'application/json'});
    await firstValueFrom(this.http.put<{message:  string; data?: ProductDto}>(url, body, {headers}));

  }
  async remove(_id: string): Promise<void> { 
    const url = `${this.base}/${encodeURIComponent(_id)}`;
    const headers = new HttpHeaders({'Content-type': 'application/json'});
    console.log ('DELETE', _id);
    await firstValueFrom(this.http.delete<{message:  string; data?: ProductDto}>(url, {headers}));
    
  }
  async checkId(_id: string): Promise<boolean> { 

    const url = `${this.base}/verification/${encodeURIComponent(_id)}`;

    try {
        return await firstValueFrom(this.http.get<boolean>(url));
    } catch (e: any ){
      console.error(e);
      return true;
    }
  }
}
