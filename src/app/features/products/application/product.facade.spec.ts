import { TestBed } from '@angular/core/testing';
import { PRODUCTS_REPOSITORY } from '../domain/products.repository';
import { Product } from '../domain/product.model';
import { ProductsFacade } from './products.facade';

describe('ProductsFacade', () => {
  const sample: Product[] = [
    { id:'p1',  name:'crédito 1',   description:'uno',   logo:'1.png', date_release:'2025-01-01', date_revision:'2026-01-01' },
    { id:'p2',  name:'crédito 2',    description:'dos',   logo:'2.png', date_release:'2025-02-01', date_revision:'2026-02-01' },
    { id:'p3',  name:'crédito 3',   description:'tres',  logo:'3.png', date_release:'2025-03-01', date_revision:'2026-03-01' },
    { id:'p4',  name:'crédito 4',   description:'cuatro',logo:'4.png', date_release:'2025-04-01', date_revision:'2026-04-01' },
    { id:'p5',  name:'crédito 5', description:'cinco', logo:'5.png', date_release:'2025-05-01', date_revision:'2026-05-01' },
    { id:'p6',  name:'crédito 6',    description:'seis',  logo:'6.png', date_release:'2025-06-01', date_revision:'2026-06-01' },
    { id:'p7',  name:'crédito 7',     description:'siete', logo:'7.png', date_release:'2025-07-01', date_revision:'2026-07-01' },
  ];

  let repo: {
    list: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
    remove: jasmine.Spy;
    checkId: jasmine.Spy;
  };

  // Facade no es @Injectable, así que lo creamos dentro de un contexto de inyección.
  const createFacade = () =>
    TestBed.runInInjectionContext(() => new ProductsFacade());

  beforeEach(() => {
    repo = {
      list: jasmine.createSpy('list').and.returnValue(Promise.resolve({ data: sample })),
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve()),
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      remove: jasmine.createSpy('remove').and.returnValue(Promise.resolve()),
      checkId: jasmine.createSpy('checkId').and.returnValue(Promise.resolve(true)),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: PRODUCTS_REPOSITORY, useValue: repo }],
    });
  });

  it('load(): carga datos, limpia error y apaga loading', async () => {
    const facade = createFacade();
    await facade.load();

    expect(repo.list).toHaveBeenCalled();
    expect(facade.allItems().length).toBe(sample.length);
    expect(facade.total()).toBe(sample.length);
    expect(facade.items().length).toBe(facade.pageSize()); // por defecto 5
    expect(facade.error()).toBeNull();
    expect(facade.loading()).toBeFalse();
  });

  it('load(): setea error cuando falla el repositorio', async () => {
    repo.list.and.returnValue(Promise.reject('boom'));
    const facade = createFacade();

    await facade.load();

    expect(facade.error()).toContain('Error al cargar productos');
    expect(facade.loading()).toBeFalse();
  });

  it('search(): filtra por id/name/description y resetea a página 1', async () => {
    const facade = createFacade();
    await facade.load();
    facade.setPageSize(2);
    facade.goToPage(2);
    expect(facade.page()).toBe(2);

    facade.search('cré'); 
    expect(facade.page()).toBe(1);
    expect(facade.total()).toBeGreaterThan(0);
    const names = facade.items().map(p => p.name.toLowerCase());
    expect(names.some(n => n.includes('crédito 2'))).toBeTrue();
  });

  it('paginación: setPageSize/goToPage/next/prev y slicing', async () => {
    const facade = createFacade();
    await facade.load();

    facade.setPageSize(2);
    expect(facade.items().length).toBe(2);
    expect(facade.page()).toBe(1);

    facade.goToPage(2);
    expect(facade.page()).toBe(2);
    expect(facade.items().length).toBe(2);

    facade.nextPage();
    expect(facade.page()).toBe(3);

    facade.prevPage();
    expect(facade.page()).toBe(2);
  });

  it('ensurePageInRange(): ajusta página si excede el total', async () => {
    const facade = createFacade();
    await facade.load();

    facade.setPageSize(10);
    facade.goToPage(99);
    expect(facade.page()).toBe(1);
  });

  it('getById(): devuelve producto si existe', async () => {
    const facade = createFacade();
    await facade.load();

    const p = await facade.getById('p3');
    expect(p?.id).toBe('p3');
    expect(facade.error()).toBeNull();
  });

  it('getById(): setea error y retorna null si no existe', async () => {
    const facade = createFacade();
    await facade.load();

    const p = await facade.getById('no-existe');
    expect(p).toBeNull();
    expect(facade.error()).toContain('Producto no encontrado');
  });

  it('create(): llama repo.create y recarga lista', async () => {
    const facade = createFacade();
    await facade.load();
    repo.list.calls.reset();

    const nuevo: Product = {
      id: 'p9', name: 'Nuevo', description: 'desc', logo: 'x.png',
      date_release: '2025-08-01', date_revision: '2026-08-01',
    };
    await facade.create(nuevo);

    expect(repo.create).toHaveBeenCalledWith(nuevo);
    expect(repo.list).toHaveBeenCalled();
    expect(facade.loading()).toBeFalse();
  });

  it('update(): llama repo.update y recarga lista', async () => {
    const facade = createFacade();
    await facade.load();
    repo.list.calls.reset();

    const editado = { ...sample[0], name: 'Alpha*' };
    await facade.update(editado);

    expect(repo.update).toHaveBeenCalledWith(editado);
    expect(repo.list).toHaveBeenCalled();
    expect(facade.loading()).toBeFalse();
  });

  it('remove(): llama repo.remove y recarga lista', async () => {
    const facade = createFacade();
    await facade.load();
    repo.list.calls.reset();

    await facade.remove('p2');

    expect(repo.remove).toHaveBeenCalledWith('p2');
    expect(repo.list).toHaveBeenCalled();
    expect(facade.loading()).toBeFalse();
  });

  it('checkId(): pasa directo al repo', async () => {
    const facade = createFacade();
    const ok = await facade.checkId('p1');

    expect(repo.checkId).toHaveBeenCalledWith('p1');
    expect(ok).toBeTrue();
  });
});