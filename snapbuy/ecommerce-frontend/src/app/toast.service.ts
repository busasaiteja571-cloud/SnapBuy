import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  remove(id: number): void {
    this.messagesSubject.next(this.messagesSubject.value.filter((message) => message.id !== id));
  }

  private show(text: string, type: ToastMessage['type']): void {
    const message = { id: this.nextId++, text, type };
    this.messagesSubject.next([...this.messagesSubject.value, message]);
    window.setTimeout(() => this.remove(message.id), 3500);
  }
}
