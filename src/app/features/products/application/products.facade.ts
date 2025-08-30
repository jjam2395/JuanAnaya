import { computed, inject, signal } from "@angular/core";
import { PRODUCTS_REPOSITORY } from "../domain/products.repository";
import { Product } from "../domain/product.model";

export class ProductsFacade {
  private repo = inject(PRODUCTS_REPOSITORY);

  readonly allItems = signal<Product[]>([]);

  readonly loading = signal(false);
  readonly error = signal<string|null>(null);
  readonly pageSize = signal(5);
  readonly query = signal('');
  readonly page     = signal(1); 


  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.allItems();
    return this.allItems().filter(p =>
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  readonly total = computed(() => this.filtered().length);

  readonly items = computed(() => {
    const size = this.pageSize();
    const p    = this.page();
    const start = (p - 1) * size;
    const end   = start + size;
    return this.filtered().slice(start, end);
  });

  async load() {
    this.loading.set(true);
    try {
      const { data } = await this.repo.list();
      this.allItems.set(data);
      this.error.set(null);
      this.ensurePageInRange();
    } catch {
      this.error.set('Error al cargar productos');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string) {
    this.loading.set(true);
    try{
      const { data } = await this.repo.list();
      const found = data.find(p => p.id === id);
      if (!found) throw new Error('Producto no encontrado');
      this.loading.set(false);
      return found;
    } catch (e) {
    this.error.set((e as Error).message || 'Error al cargar producto');
      return null;
    } finally {
    this.loading.set(false);
    }
  }

  async create(product: Product) {
    this.loading.set(true);
    try {
      await this.repo.create(product);
      await this.load();
    } catch (e){
      this.error.set('No se pudo crear el producto: '+e)
    }
  }

  async update(product: Product) {
    this.loading.set(true);
    try {
      await this.repo.update(product);
      await this.load();
    } finally {
      this.loading.set(false);
    }
  }

  async checkId(id: string): Promise <boolean> {
    return this.repo.checkId(id);
  }

   search(q: string) {
    this.query.set(q);
    this.page.set(1);
    this.ensurePageInRange();
  }

  setPageSize(n: number) {
    this.pageSize.set(n);
    this.page.set(1);
    this.ensurePageInRange();
  }

  goToPage(n: number) {
    this.page.set(n);
    this.ensurePageInRange();
  }

  nextPage() { this.goToPage(this.page() + 1); }
  prevPage() { this.goToPage(this.page() - 1); }


  async remove(id: string) {
    this.loading.set(true);
    try {
      await this.repo.remove(id);
      await this.load();
    } finally {
      this.loading.set(false);
    }
  }

  private ensurePageInRange() {
    const pages = Math.max(1, Math.ceil(this.total() / this.pageSize()));
    if (this.page() > pages) this.page.set(pages);
    if (this.page() < 1) this.page.set(1);
  }

}