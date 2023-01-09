import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Board, BoardCreation, BoardUpdate } from '../models/board.model';
import { Goal, GoalCreation } from '../models/goal.model';
import { Project, ProjectCreation, ProjectUpdate } from '../models/project.model';
import { TaskCreation, TaskUpdate, Task } from '../models/task.model';
import { UserBasicInfo } from '../models/user.model';
import { ManagementService } from './management.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  readonly baseUrl = environment.useEmulators
    ? 'http://localhost:5001/kanb-list/us-central1'
    : 'https://us-central1-kanb-list.cloudfunctions.net';
  readonly apiVer = 'v1';

  readonly baseUrlProjects = `${this.baseUrl}/apiprojects/api/${this.apiVer}`;
  readonly baseUrlGoals = `${this.baseUrl}/apigoals/api/${this.apiVer}`;
  readonly baseUrlBoards = `${this.baseUrl}/apiboards/api/${this.apiVer}`;
  readonly baseUrltasks = `${this.baseUrl}/apitasks/api/${this.apiVer}`;
  readonly baseUrlUsers = `${this.baseUrl}/apiusers/api/${this.apiVer}`;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private managementService: ManagementService,
  ) { }

  // #region Projects

  createProject(projectData: ProjectCreation, successMessage = 'Project saved correctly', errorMessage = 'Error while saving project') {
    const body = {
      projectData,
    };
    return this.http.post(this.baseUrlProjects + '/create', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success(successMessage, 'Success'),
        }),
        catchError((error) => {
          this.toastr.error(errorMessage, 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  updateProject(owner: UserBasicInfo, projectId: string, projectData: ProjectUpdate) {
    const body = {
      projectId,
      projectData,
      owner,
    };
    return this.http.patch(this.baseUrlProjects + '/edit', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Project saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving project', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // #endregion


  // #region Goals

  createGoal(project: Project, goalData: GoalCreation) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalData,
    };
    return this.http.post(this.baseUrlGoals + '/create', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Goal saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving goal', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // #endregion

  // #region Boards

  createBoard(project: Project, goal: Goal, boardData: BoardCreation) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardData,
    };
    return this.http.post(this.baseUrlBoards + '/create', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Board saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving board', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  editBoard(project: Project, goal: Goal, board: Board, boardData: BoardUpdate) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardId: board.id,
      boardData,
    };
    return this.http.post(this.baseUrlBoards + '/edit', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Board saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving board', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // #endregion

  // #region Tasks

  createTask(project: Project, goal: Goal, board: Board, taskData: TaskCreation) {
    const body = {
      projectInfo: {
        owner: project.owner,
        id: project.id,
      },
      goalId: goal.id,
      boardId: board.id,
      taskData,
    };
    return this.http.post(this.baseUrltasks + '/create', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Task saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving task', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  editTask(project: Project, goal: Goal, board: Board, task: Task, taskData: TaskUpdate) {
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
    return this.http.post(this.baseUrltasks + '/edit', body, { responseType: 'json' })
      .pipe(
        tap({
          complete: () => this.toastr.success('Task saved correctly', 'Success'),
        }),
        catchError((error) => {
          this.toastr.error('Error while saving task', 'Error');
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // #endregion

  // #region Users

  getUserInfo(uid: string): Observable<any> {
    return this.http.get(this.baseUrlUsers + '/info/' + uid, { responseType: 'json' })
      .pipe(
        catchError((error) => {
          this.managementService.error(error);
          return of(null);
        }),
      );
  }

  // #endregion

}
