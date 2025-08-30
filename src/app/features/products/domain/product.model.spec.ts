import { makeProduct, Product } from './product.model';

describe('Product domain', () => {
  it('creates a valid product when revision is exactly +1 year', () => {
    const release = '2025-08-27';
    const revision = '2026-08-27';

    const p: Product = {
      id: 'XYZ123',
      name: 'Super cuenta',
      description: 'cuenta de cheques para personas físicas',
      logo: 'logo.png',
      date_release: release,
      date_revision: revision,
    };

    const result = makeProduct(p);
    expect(result.id).toBe('XYZ123');
  });

  it('throws if revision is not exactly +1 year', () => {
    const release = '2025-08-27';
    const badRevision = '2026-08-28';

    const p = {
      id: 'XYZ123',
      name: 'Super cuenta',
      description: 'cuenta de cheques para personas físicas',
      logo: 'logo.png',
      date_release: release,
      date_revision: badRevision,
    } as const;

    expect(() => makeProduct(p)).toThrowError(
      'La fecha de revision debe ser exactamente un año despues de la fecha de release'
    );
  });
});