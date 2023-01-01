import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectCreation } from '../models/projects.model';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, tap } from 'rxjs';
import { ManagementService } from './management.service';
import { defaultImage } from 'src/assets/Projects/valid-images.project';
import { StorageService } from './storage.service';

@Injectable()
export class DataService {

  // FIXME: This is a temporary solution to call the APIs
  baseUrlProjects = 'http://localhost:5001/kanb-list/us-central1/apiprojects/api/v1';

  private projectsDescs: { [key: string]: string } = {};

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private managementService: ManagementService,
    private storageService: StorageService,
  ) { }

  // #region Projects

  createProject(projectData: ProjectCreation, successMessage = 'Project saved correctly', errorMessage = 'Error while saving project') {
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

  async getProjectDesc(owner: string, projectId: string) {
    if (this.projectsDescs[projectId]) return this.projectsDescs[projectId];
    const projectDescResp = await this.storageService.getBlobText(`users/${owner}/projects/${projectId}/description.json`);
    if (!projectDescResp.success) return '';
    this.projectsDescs[projectId] = projectDescResp.text;
    return this.projectsDescs[projectId];
  }

  get defaultProjImage() {
    return defaultImage;
  }

  // #endregion
}
