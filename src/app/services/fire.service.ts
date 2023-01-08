import { Injectable, isDevMode } from '@angular/core';
import {
  Firestore, doc, setDoc, serverTimestamp, DocumentReference, DocumentData, WithFieldValue,
  collection, query, QueryConstraint, CollectionReference, onSnapshot, docSnapshots, Unsubscribe, orderBy,
  where, FieldPath, WhereFilterOp, updateDoc
} from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { GralDoc } from '../models/docs.model';
import { ManagementService } from './management.service';
import sizeof from 'firestore-size';

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

  //  #region Query

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
    return orderBy(field, direction);
  }

  where(field: string | FieldPath, operator: WhereFilterOp, value: unknown): QueryConstraint {
    return where(field, operator, value);
  }

  //  #endregion

  setDoc(doc: DocumentReference<DocumentData>, data: WithFieldValue<DocumentData>): Promise<any> {
    return setDoc(doc, {
      ...data,
      updatedAt: this.timestamp,
      createdAt: this.timestamp,
    });
  }

  updateDoc(doc: DocumentReference<unknown> | string, data: Partial<unknown>) {
    const docRef = typeof doc === 'string' ? this.doc(doc) : doc;
    return updateDoc(docRef, {
      ...data,
      updatedAt: this.timestamp,
      // updatedBy:
    });
  }

  // TODO: Add type
  doc$(path: string): Observable<any> {
    return docSnapshots(this.doc(path)).pipe(
      map((doc) => {
        if (isDevMode()) {
          const bytes = sizeof({ ...doc.data() });
          this.managementService.log(`Reading doc ${doc.id} - ${this.formatBytes(bytes)}`);
        }
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
      if (isDevMode()) {
        const bytes = sizeof({ ...doc.data() });
        this.managementService.log(`Reading doc ${doc.id} - ${this.formatBytes(bytes)}`);
      }
      const finalData: GralDoc = {
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

  onSnapshotCol$(path: string, callback: Function, queryFn?: QueryConstraint[]): Unsubscribe {
    return onSnapshot(queryFn ? this.col(path, queryFn) : this.col(path), (querySnapshot) => {
      if (querySnapshot.empty) return callback([]);
      const finalData: GralDoc[] = querySnapshot.docs.map((doc) => {

        if (isDevMode()) {
          const bytes = sizeof(doc.data());
          this.managementService.log(`Reading doc ${doc.id} - ${this.formatBytes(bytes)}`);
        }

        return {
          id: doc.id,
          ...doc.data(),
          path: doc.ref.path,
          exists: doc.exists(),
          fromCache: querySnapshot.metadata.fromCache,
        }
      });
      return callback(finalData);
    },
      (error) => {
        this.toastr.error('Error getting new data', 'Error');
        this.managementService.error('Error onSnapshotCol$ fireService', error);
      })
  }

  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
