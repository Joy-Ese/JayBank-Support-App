import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderTimeout: any;
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  private _enabled = true;

  enable() {
    this._enabled = true;
  }

  disable() {
    this._enabled = false;
  }

  show() {
    if (this._enabled) {
      clearTimeout(this.loaderTimeout);
      this.loaderTimeout = setTimeout(() => {
        this._loading.next(true);
      }, 200); // delay before showing to avoid flash
    }
  }

  hide() {
    clearTimeout(this.loaderTimeout);
    this._loading.next(false);
  }

}
