import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, serverTimestamp, DocumentReference, DocumentData, WithFieldValue, collection, query, QueryConstraint, CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  get timestamp() {
    return serverTimestamp();
  }

  constructor(
    private firestore: Firestore,
  ) { }

  //  #region Reference

  doc(path: string): DocumentReference<DocumentData> {
    return doc(this.firestore, path);
  }

  col(path: string, queryFn?: QueryConstraint[]): CollectionReference<DocumentData> {
    const col = collection(this.firestore, path);
    if (queryFn) return query(col, ...queryFn) as CollectionReference<DocumentData>;
    return col;
  }

  //  #endregion

  setDoc(doc: DocumentReference<DocumentData>, data: WithFieldValue<DocumentData>): Promise<any> {
    return setDoc(doc, {
      ...data,
      updatedAt: this.timestamp,
      createdAt: this.timestamp,
    });
  }

}
