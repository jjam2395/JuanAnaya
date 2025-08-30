import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { HttpProductsRepository } from './http-products.repository';
import { Product } from '../domain/product.model';

describe('HttpProductsRepository', () => {
  let repo: HttpProductsRepository;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const base = '/bp/products';

  const dto = {
    id: 'p1',
    name: 'product 1',
    description: 'desc',
    logo: '1.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  const product: Product = { ...dto };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    repo = new HttpProductsRepository(http);
  });

  afterEach(() => httpMock.verify());

  it('list() debe mapear GET /bp/products a {data,total}', async () => {
    const promise = repo.list();

    const req = httpMock.expectOne({ method: 'GET', url: base });
    expect(req.request.method).toBe('GET');

    req.flush({ data: [dto, { ...dto, id: 'p2' }] });

    const res = await promise;
    expect(res.total).toBe(2);
    expect(res.data[0].id).toBe('p1');
    expect(res.data[1].id).toBe('p2');
  });

  it('create() debe enviar POST con body y headers JSON', async () => {
    const p = repo.create(product);

    const req = httpMock.expectOne({ method: 'POST', url: base });
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-type')).toBe('application/json');

    expect(req.request.body).toEqual(dto);

    req.flush({ message: 'ok', data: dto });

    await expectAsync(p).toBeResolved();
  });

  it('update() debe PUT /bp/products/:id con body sin id', async () => {
    const edited = { ...product, name: 'product 1*' };
    const p = repo.update(edited);

    const req = httpMock.expectOne({
      method: 'PUT',
      url: `${base}/${encodeURIComponent(edited.id)}`,
    });
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Content-type')).toBe('application/json');

    expect(req.request.body).toEqual({
      name: 'product 1*',
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    });

    req.flush({ message: 'ok', data: { ...dto, name: 'product 1*' } });

    await expectAsync(p).toBeResolved();
  });

  it('remove() debe DELETE /bp/products/:id', async () => {
    const p = repo.remove('p1');

    const req = httpMock.expectOne({
      method: 'DELETE',
      url: `${base}/p1`,
    });
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Content-type')).toBe('application/json');

    req.flush({ message: 'ok' });

    await expectAsync(p).toBeResolved();
  });

  it('checkId() true/false según respuesta del backend', async () => {
    // true
    const pTrue = repo.checkId('p1');
    httpMock.expectOne(`${base}/verification/p1`).flush(true);
    await expectAsync(pTrue).toBeResolvedTo(true);

    // false
    const pFalse = repo.checkId('pX');
    httpMock.expectOne(`${base}/verification/pX`).flush(false);
    await expectAsync(pFalse).toBeResolvedTo(false);
  });

  it('checkId() devuelve true si el GET falla (comportamiento diseñado)', async () => {
    const p = repo.checkId('fallo');
    const req = httpMock.expectOne(`${base}/verification/fallo`);
    req.error(new ErrorEvent('Network'), { status: 500 });

    await expectAsync(p).toBeResolvedTo(true);
  });

  it('usa encodeURIComponent en rutas (ids con espacios)', async () => {
    const p = repo.update({ ...product, id: 'p con espacio' });

    const req = httpMock.expectOne(
      `${base}/p%20con%20espacio`
    );
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'ok' });

    await expectAsync(p).toBeResolved();
  });
});