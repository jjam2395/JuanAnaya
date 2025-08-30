import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Product } from '../../domain/product.model';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

export interface ProductFormValue  {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
};

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss'
})
export class AddProduct implements OnChanges {

  private fb = inject(FormBuilder);
  private el = inject(ElementRef<HTMLElement>);
  private router = inject(Router);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() product?: Product;
  @Input() model: Product | null = null;
  @Input() checkId!: (id: string) => Promise<boolean>;
  @Output() save = new EventEmitter<Product>();
  

  today = new Date();

  form = this.fb.group({
    id: this.fb.control(
      '',
      {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        asyncValidators: [],
        updateOn: 'blur', 
      }
    ),
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required]],
    date_release: this.fb.control('', {
      validators: [Validators.required, this.dateNotPastValidator()],
      updateOn: 'change',
    }),
    date_revision: this.fb.control('', {
    validators: [Validators.required],
    updateOn: 'change',
    }),
  }, { validators: [this.oneYearAfter('date_release', 'date_revision')] });

  ngOnChanges() {
    if (this.model) {
      this.form.reset({
        id: this.model.id,
        name: this.model.name,
        description: this.model.description,
        logo: this.model.logo,
        date_release: this.toISO(this.model.date_release),
        date_revision: this.toISO(this.model.date_revision),
      });
    } else {
      this.form.reset();
    }
    const idCtrl = this.form.controls['id'];
    if (this.mode === 'edit') {
      idCtrl.clearAsyncValidators();
      idCtrl.disable({ emitEvent: false });
    } else {
      idCtrl.enable({ emitEvent: false });
      idCtrl.setAsyncValidators(this.uniqueIdValidator(this.checkId));
      idCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

oneYearAfter(field1: string, field2: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const d1 = group.get(field1)?.value as string | null; 
    const d2 = group.get(field2)?.value as string | null;
    if (!d1 || !d2) return null;

    const iso1 = this.toISO(d1);
    const iso2 = this.toISO(d2);

    const [y1, m1, day1] = iso1.split('-').map(Number);
    const expectedDate = new Date(y1 + 1, m1 - 1, day1);

    const expectedIso =
      `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2,'0')}-${String(expectedDate.getDate()).padStart(2,'0')}`;

    return iso2 === expectedIso ? null : { notOneYearAfter: true };
  };
}

  private toISO(input: string): string {
    if (!input) return input;
    if (input.includes('/')) {
      const [d, m, y] = input.split('/');
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    return input; 
  }

  private todayYMD(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2,'0');
    const d = String(now.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  dateNotPastValidator(): ValidatorFn {
    return (ctrl) => {
      let v = ctrl.value as string | null;
      if (!v) return null;
      v = this.toISO(v);
      return v >= this.todayYMD() ? null : { dateInPast: true };
    };
  }


  private uniqueIdValidator(fn: (id: string) => Promise<boolean>): AsyncValidatorFn {
    return async (ctrl) => {
      const id = (ctrl.value ?? '').trim();
      if (!id) return null;
      try {
      const exists = await fn(id); 
      return exists ? { idTaken: true } : null; 
    } catch {
      return { idVerificationError: true }; 
    }
    };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('formulario invalido')
      return;
    }
    console.log('formulario valido emitiendo...')
    this.form.controls['id'].enable();
    const v = this.form.value;
    this.save.emit({
      id: v.id!,
      name: v.name!,
      description: v.description!,
      logo: v.logo!,
      date_release: this.toISO(v.date_release!),
      date_revision: this.toISO(v.date_revision!),
    });
  }

  reset() {
    this.form.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
  }

  back(){
    this.router.navigate(['/products']);
  }
}


