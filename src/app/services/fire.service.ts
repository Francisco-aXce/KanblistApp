import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, serverTimestamp, DocumentReference, DocumentData, WithFieldValue, collection, query, QueryConstraint, CollectionReference, onSnapshot, docSnapshots, Unsubscribe, orderBy } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';
import { gralDoc } from '../models/docs.model';
import { ManagementService } from './management.service';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  get timestamp() {
    return serverTimestamp();
  }

  constructor(
    private firestore: Firestore,
    private managementService: ManagementService,
    private toastr: ToastrService,
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

  doc$(path: string) {
    return docSnapshots(this.doc(path)).pipe(
      map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
          path: doc.ref.path,
          exists: doc.exists(),
        }
      }),
    );
  }

  onSnapshotDoc$(path: string, callback: Function): Unsubscribe {
    return onSnapshot(this.doc(path), (doc) => {
      if (!doc.exists()) return callback(null);
      const finalData: gralDoc = {
        id: doc.id,
        ...doc.data(),
        path: doc.ref.path,
        exists: doc.exists(),
      }
      return callback(finalData);
    },
      (error) => {
        this.toastr.error('Error getting data', 'Error');
        this.managementService.error('Error onSnapshotDoc$ fireService', error);
      });
  }

  onSnapshotCol$(path: string, callback: Function): Unsubscribe {
    return onSnapshot(this.col(path, [orderBy('createdAt', 'desc')]), (querySnapshot) => {
      if (querySnapshot.empty) return callback([]);
      const finalData: gralDoc[] = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
          path: doc.ref.path,
          exists: doc.exists(),
        }
      });
      return callback(finalData);
    },
      (error) => {
        this.toastr.error('Error getting new data', 'Error');
        this.managementService.error('Error onSnapshotCol$ fireService', error);
      });
  }

}