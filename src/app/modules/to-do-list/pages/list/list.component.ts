import { Component, signal, computed } from '@angular/core';
import Swal from 'sweetalert2';

// 👇 1. VOCÊ PRECISA DESSA IMPORTAÇÃO AQUI NO TOPO! 👇
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { InputAddItemComponent } from '../../components/input-add-item/input-add-item.component';
import { InputListItemComponent } from '../../components/input-list-item/input-list-item.component';
import { IListItems } from '../../interface/IListItems.iterface';
import { ELocalStorage } from '../../enum/ELocalStorage.enum';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [InputAddItemComponent, InputListItemComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  public addItem = signal(true);

  #setListItems = signal<IListItems[]>(this.#parseItems());
  public getListItems = this.#setListItems.asReadonly();

  public filterStatus = signal<'all' | 'pending' | 'completed'>('all');

  public listItemsFiltered = computed(() => {
    const filter = this.filterStatus();
    const list = this.#setListItems();

    if (filter === 'pending') {
      return list.filter((res) => !res.checked);
    }

    if (filter === 'completed') {
      return list.filter((res) => res.checked);
    }

    return list;
  });

  #parseItems() {
    return JSON.parse(localStorage.getItem(ELocalStorage.MY_LIST) || '[]');
  }

  #updateLocalStorage() {
    return localStorage.setItem(
      ELocalStorage.MY_LIST,
      JSON.stringify(this.#setListItems())
    );
  }

  public getInputAndAddItem(value: IListItems) {
    localStorage.setItem(
      ELocalStorage.MY_LIST,
      JSON.stringify([...this.#setListItems(), value])
    );

    return this.#setListItems.set(this.#parseItems());
  }

  public updateItemCheckbox(newItem: { id: string; checked: boolean }) {
    this.#setListItems.update((oldValue: IListItems[]) => {
      oldValue.filter((res) => {
        if (res.id === newItem.id) {
          res.checked = newItem.checked;
          return res;
        }
        return res;
      });
      return oldValue;
    });
    return this.#updateLocalStorage();
  }

  public updateItemText(newItem: { id: string; value: string }) {
    this.#setListItems.update((oldValue: IListItems[]) => {
      oldValue.filter((res) => {
        if (res.id === newItem.id) {
          res.value = newItem.value;
          return res;
        }
        return res;
      });
      return oldValue;
    });
    return this.#updateLocalStorage();
  }

  public deleteItem(id: string) {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter isso!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, delete o item',
    }).then((result) => {
      if (result.isConfirmed) {
        this.#setListItems.update((oldValue: IListItems[]) => {
          return oldValue.filter((res) => res.id !== id);
        });
        return this.#updateLocalStorage();
      }
    });
  }

  public deleteAllItems() {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter isso!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, delete tudo',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(ELocalStorage.MY_LIST);
        return this.#setListItems.set(this.#parseItems());
      }
    });
  }

  // 👇 2. A FUNÇÃO TEM QUE ESTAR AQUI NO FINAL DA CLASSE 👇
  public moveItem(event: CdkDragDrop<IListItems[]>) {
    if(this.filterStatus() !== 'all') return;

    this.#setListItems.update((currentList) => {
      const newList = [...currentList];
      moveItemInArray(newList, event.previousIndex, event.currentIndex);
      return newList;
    });
    this.#updateLocalStorage();
  }
}