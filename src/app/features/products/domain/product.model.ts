export interface Product {
    id:string;
    name:string;
    description:string;
    logo:string;
    date_release: string;
    date_revision: string;
}

function addOneYear(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d); // local
  date.setFullYear(date.getFullYear() + 1);

  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function makeProduct(product: Product): Product {
  const expectedRevision = addOneYear(product.date_release);

  if (product.date_revision !== expectedRevision) {
    throw new Error('La fecha de revision debe ser exactamente un año despues de la fecha de release');
  }

  return product;
}