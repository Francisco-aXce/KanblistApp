import { Injectable } from '@angular/core';
import { getBlob, ref, Storage, StorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage,
  ) { }

  getBlobText(file: StorageReference | string) {
    const fileRef = typeof file === 'string' ? ref(this.storage, file) : file;
    return getBlob(fileRef).then(async blob => ({
      text: await blob.text(),
      success: true,
    }))
      .catch(error => ({
        error,
        success: false,
        text: '',
      }));
  }
}
