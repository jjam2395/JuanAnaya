import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  standalone: true,
  selector: 'app-input-search',
  imports: [],
  templateUrl: './input-search.html',
  styleUrl: './input-search.scss'
})

export class InputSearch implements OnDestroy{

    @Input() value='';
    @Input() placeholder='Buscar productos...';
    @Input() disabled = false;
    @Input() debounceMs = 500;
    @Output() valueChange = new EventEmitter<string>();
    @Output() debouncingChange = new EventEmitter<boolean>();
    private debouncing = false;

    private input$ = new Subject<string>();
    private destroy$ = new Subject<string>();

    constructor() {
      this.input$
      .pipe(debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(v => {
        if (this.debouncing) {
          this.debouncing = false;
          this.debouncingChange.emit(false);
        }
        this.valueChange.emit(v);
      });
    }

    onInput(e: Event) {
      const v = (e.target as HTMLInputElement).value ?? '';
      if (!this.debouncing) {
        this.debouncing = true;
        this.debouncingChange.emit(true);
      }
      this.input$.next(v);
    }

    ngOnDestroy(): void {
      this.destroy$.next('');
      this.destroy$.complete();
    }
}
