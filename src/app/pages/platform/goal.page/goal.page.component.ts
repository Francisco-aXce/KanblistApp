import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, lastValueFrom, of, Subject } from 'rxjs';
import { catchError, concatMap, distinctUntilChanged, map, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Options } from 'sortablejs';
import { Board } from 'src/app/models/board.model';
import { Goal } from 'src/app/models/goal.model';
import { Project } from 'src/app/models/project.model';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';

@Component({
  selector: 'app-goal.page',
  templateUrl: './goal.page.component.html',
  styleUrls: ['./goal.page.component.scss']
})
export class GoalPageComponent implements OnInit {

  @ViewChild('modalBoard') modalBoard!: HTMLElement;
  @ViewChild('modalTask') modalTask!: HTMLElement;

  editMode = false;
  boardToEdit?: any;
  taskToEdit?: any;

  boardsLoaded = false;
  loadingPreview = false;
  loadingSave = false;

  // #region Main data

  project!: Project;
  goal!: Goal;
  boards!: Board[]

  // #endregion

  projectObs$ = combineLatest([
    this.route.params.pipe(distinctUntilChanged((a, b) => {
      return (a['projectId'] === b['projectId' || a['goalId'] === b['goalId']]);
    })),
    this.authService.userInfo$,
  ]).pipe(
    map(([params, userInfo]) => ({
      projectPath: `users/${userInfo!.claims.uid}/projects/${params['projectId']}`,
      goalPath: `users/${userInfo!.claims.uid}/projects/${params['projectId']}/goals/${params['goalId']}`,
      boardsPath: `users/${userInfo!.claims.uid}/projects/${params['projectId']}/goals/${params['goalId']}/boards`,
    })),
    switchMap((paths) => {
      return combineLatest([
        this.fireService.doc$(paths.goalPath),
        this.fireService.col$(paths.boardsPath),
        this.fireService.doc$(paths.projectPath).pipe(
          concatMap((projectData) => {
            return projectData.exists ? this.apiService.getUserInfo(projectData.owner.id).pipe(
              map((ownerData) => {
                return { ...projectData, owner: ownerData };
              }),
              take(1),
            ) : of(projectData);
          }),
        ),
      ]).pipe(
        tap(([goal, boards, project]) => {
          const toAnalize = [goal, project];
          if (toAnalize.some((data: any) => !data.exists)) {
            this.router.navigateByUrl('/platform');
            throw new Error('Reading unexisting data');
          }
        }),
        map(([goal, boards, project]) => ({ goal, boards, project })),
      );
    }),
    tap((data) => {
      this.managementService.log('GoalPageComponent', 'projectObs', data);
    }),
    catchError((err) => {
      this.managementService.error(err);
      this.managementService.toastError('Problem loading data');
      return of(null);
    }),
    shareReplay(1),
  );
  destroy$: Subject<boolean> = new Subject();

  readonly boardForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(17)]),
  });

  get name() { return this.boardForm.get('name') as UntypedFormControl; }

  readonly taskForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(40)]),
  });

  get taskName() { return this.taskForm.get('name') as UntypedFormControl; }

  editBoardCallback = (board: any) => {
    this.onEditBoard(board);
  };

  addTaskCallback = (board: any) => {
    this.onAddTask(board);
  };

  editTaskCallback = (board: any, task: any) => {
    this.onEditTask(board, task);
  };

  boardsDndOptions: Options = {
    direction: 'horizontal',
    handle: '.handle',
    draggable: '.board-drag',
    onUpdate: () => {
      this.sortBoards();
    },
  }

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private fireService: FireService,
    private authService: AuthService,
    private managementService: ManagementService,
    private apiService: ApiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.projectObs$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      if (!data) return;
      this.project = data.project;
      this.goal = data.goal;
      this.boards = this.getBoards(data.goal, data.boards as Board[]);
      this.boardsLoaded = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private getBoards(goal: Goal, boards: Board[]): Board[] {
    const sortedIds = goal?.boards || [];
    const restBoards = boards.filter((board) => !sortedIds.some((brd) => brd.id === board.id))

    const sorted = sortedIds.reduce((sorted: Board[], option) => {
      const board = boards.find((board) => board.id === option.id);
      if (board) sorted.push(board);
      return sorted;
    }, []);

    return [...sorted, ...restBoards];
  }

  openBoardModal() {
    this.boardForm.reset();
    this.modalService.open(this.modalBoard, { centered: true });
  }

  onCreateBoard() {
    this.boardToEdit = undefined;
    this.editMode = false;

    this.openBoardModal();
  }

  onEditBoard(board: any) {
    this.boardToEdit = board;
    this.editMode = true;

    this.openBoardModal();
    this.boardForm.patchValue(board);
  }

  async saveBoard() {
    this.boardForm.markAllAsTouched();
    this.loadingSave = true;
    if (this.boardForm.invalid || this.loadingPreview) return;

    const finalData = {
      name: this.name.value,
    };

    if (this.editMode) {
      await lastValueFrom(this.apiService.editBoard(this.project, this.goal, this.boardToEdit, finalData))
        .then(() => {
          this.modalService.dismissAll();
          this.editMode = false;
        });
    } else {
      await lastValueFrom(this.apiService.createBoard(this.project, this.goal, finalData))
        .then(() => {
          this.modalService.dismissAll();
        })
        .catch((err) => {
          this.managementService.error(err);
          const userMessage = err?.error?.success !== undefined ? err.error?.message : 'Problem creating board';
          this.managementService.toastError(userMessage);
        });
    }

    this.loadingSave = false;

  }

  async sortBoards() {
    const boardsToSet = this.boards.map((board) => ({
      id: board.id,
    }));

    await this.fireService.updateDoc(this.goal.path, {
      boards: boardsToSet,
    });
    this.managementService.log('sorted');
  }

  // TODO: Add type
  onAddTask(board: any) {
    this.boardToEdit = board;

    this.taskForm.reset();
    this.modalService.open(this.modalTask, { centered: true });
  };

  async saveTask() {
    this.taskForm.markAllAsTouched();
    this.loadingSave = true;
    if (this.taskForm.invalid || this.loadingPreview) return;

    const finalData: any = {
      name: this.taskName.value,
    };

    if (this.editMode) {
      if (Object.keys(finalData).every(key => finalData[key] === this.taskToEdit?.[key])) return;
      await lastValueFrom(this.apiService.editTask(this.project, this.goal, this.boardToEdit, this.taskToEdit, finalData))
        .then(() => {
          this.modalService.dismissAll();
          this.taskToEdit = undefined;
          this.editMode = false;
        });
    } else {
      await lastValueFrom(this.apiService.createTask(this.project, this.goal, this.boardToEdit, finalData)).
        then(() => {
          this.modalService.dismissAll();
        })
        .catch((err) => {
          this.managementService.error(err);
          const userMessage = err?.error?.success !== undefined ? err.error?.message : 'Problem creating task';
          this.managementService.toastError(userMessage);
        });
    }

    this.boardToEdit = undefined;
    this.loadingSave = false;

  }

  onEditTask(board: any, task: any) {
    this.boardToEdit = board;
    this.taskToEdit = task;
    this.editMode = true;

    this.taskForm.reset();
    this.modalService.open(this.modalTask, { centered: true });
    this.taskForm.patchValue(task);
  }

}
