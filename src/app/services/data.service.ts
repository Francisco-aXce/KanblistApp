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
  private goalsDescs: { [key: string]: string } = {};

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

  // TODO: Types
  updateProject(owner: { id: string }, projectId: string, projectData: any) {
    const body = {
      projectId,
      projectData,
      owner,
    };
    return this.http.put(this.baseUrlProjects + '/edit', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Project saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving project', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // TODO: Add and fix types
  createGoal(project: any, goalData: any) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalData,
    };
    return this.http.post(this.baseUrlProjects + '/createGoal', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Goal saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving goal', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // TODO: Add and fix types
  createBoard(project: any, goal: any, boardData: any) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardData,
    };
    return this.http.post(this.baseUrlProjects + '/createBoard', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Board saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving board', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  editBoard(project: any, goal: any, board: any, boardData: any) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardId: board.id,
      boardData,
    };
    return this.http.post(this.baseUrlProjects + '/editBoard', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Board saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving board', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // TODO: Add and fix types
  createTask(project: any, goal: any, board: any, taskData: any) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardId: board.id,
      taskData,
    };
    return this.http.post(this.baseUrlProjects + '/createTask', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Task saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving task', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // TODO: Add and fix types
  editTask(project: any, goal: any, board: any, task: any, taskData: any) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardId: board.id,
      taskId: task.id,
      taskData,
    };
    return this.http.post(this.baseUrlProjects + '/editTask', body, { responseType: 'json' })
      .pipe(
        tap(() => this.toastr.success('Task saved correctly', 'Success')),
        catchError((error) => {
          this.toastr.error('Error while saving task', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // FIXME: Repetitive code
  async getProjectDesc(owner: string, projectId: string, refresh = false) {
    if (this.projectsDescs[projectId] && !refresh) return this.projectsDescs[projectId];
    const projectDescResp = await this.storageService.getBlobText(`users/${owner}/projects/${projectId}/description.json`);
    if (!projectDescResp.success) return '';
    this.projectsDescs[projectId] = projectDescResp.text;
    return this.projectsDescs[projectId];
  }

  async getGoalDesc(owner: string, projectId: string, goalId: string, refresh = false) {
    if (this.goalsDescs[goalId] && !refresh) return this.goalsDescs[goalId];
    const goalDescResp = await this.storageService.getBlobText(`users/${owner}/projects/${projectId}/goals/${goalId}/description.json`);
    if (!goalDescResp.success) return '';
    this.goalsDescs[goalId] = goalDescResp.text;
    return this.goalsDescs[goalId];
  }

  updateLocalProjectDesc(projectId: string, desc: string) {
    this.projectsDescs[projectId] = desc;
  }

  get defaultProjImage() {
    return defaultImage;
  }

  // #endregion
}
