import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models/projects.model';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { ManagementService } from './management.service';
import { defaultImage } from 'src/assets/Projects/valid-images.project';

@Injectable()
export class DataService {

  // FIXME: This is a temporary solution to call the APIs
  baseUrlProjects = 'http://localhost:5001/kanb-list/us-central1/apiprojects/api/v1';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private managementService: ManagementService,
  ) { }

  // #region Projects

  createProject(projectData: Project, successMessage = 'Project saved correctly', errorMessage = 'Error while saving project') {
    const body = {
      projectData,
    };
    return this.http.post(this.baseUrlProjects + '/create', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success(successMessage, 'Success')),
        catchError((error) => {
          this.toastr.error(errorMessage, 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  errorImgProject(event: Event) {
    (event.target as HTMLImageElement).src = `assets/Projects/${defaultImage}.webp`;
  }

  // #endregion
}
