import { Component, OnInit, ViewChild } from '@angular/core';
import { Unsubscribe } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, firstValueFrom, lastValueFrom, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Options } from 'sortablejs';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
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

  projOwner: any;

  data: any;
  projectObs = this.route.params.pipe(
    switchMap(({ projectId, goalId }) => this.authService.userInfo$.pipe(
      map((user) => ({ projectId, goalId, claims: user?.claims, }))
    )),
    switchMap(({ projectId, goalId, claims }) => {
      const projectPath = `users/${claims?.['user_id']}/projects/${projectId}`;
      return combineLatest([
        this.fireService.doc$(projectPath).pipe(
          switchMap((projectData) => {
            if (this.projOwner) {
              return of({ ...projectData, owner: this.projOwner });
            }
            return this.dataService.getUserInfo(projectData.owner.id).pipe(
              map((ownerData) => {
                this.projOwner = ownerData;
                return { ...projectData, owner: ownerData };
              }),
              take(1),
            )
          }),
        ),
        this.fireService.doc$(`${projectPath}/goals/${goalId}`),
      ]).pipe(
        map(([project, goal]) => ({ project, goal, claims })),
      );
    }),
    shareReplay(1),
    tap((data) => {
      this.managementService.log('GoalPageComponent', 'projectObs', data);

      if (!this.boardsUnsub) {
        this.managementService.log('setting boards unsub');
        this.boardsUnsub = this.fireService.onSnapshotCol$(`${data.goal.path}/boards`,
          async (boards: any[]) => await this.getBoards(boards),
          [this.fireService.where('active', '==', true)]);
      }

      this.data = data;
    }),
  );
  boardsUnsub?: Unsubscribe;

  // TODO: Add type
  boards: any[] = [];

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
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.boardsUnsub?.();
  }

  // TODO: Add type
  // FIXME: Repetitive code with goals
  async getBoards(boards: any[]) {
    const boardsRaw = boards;
    const obsData = await firstValueFrom(this.projectObs);
    const sortedBoardsIds = obsData.goal.boards ?? [];
    const finalBoards: any[] = [];

    for (const boardInfo of sortedBoardsIds) {
      const board = boardsRaw.find((b) => b.id === boardInfo.id);
      if (board) finalBoards.push(board);
    }
    const restBoards = boardsRaw.filter((b) => !finalBoards.find((s) => s.id === b.id));
    finalBoards.push(...restBoards);

    this.boards = finalBoards;
    this.boardsLoaded = true;
    this.managementService.log('Boards final', this.boards);
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
      await lastValueFrom(this.dataService.editBoard(this.data.project, this.data.goal, this.boardToEdit, finalData))
        .then(() => {
          this.modalService.dismissAll();
          this.editMode = false;
        });
    } else {
      await lastValueFrom(this.dataService.createBoard(this.data.project, this.data.goal, finalData))
        .then(() => {
          this.modalService.dismissAll();
        });
    }

    this.loadingSave = false;

  }

  async sortBoards() {
    const boardsToSet = this.boards.map((board) => ({
      id: board.id,
    }));

    await this.fireService.updateDoc(this.data.goal.path, {
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
      await lastValueFrom(this.dataService.editTask(this.data.project, this.data.goal, this.boardToEdit, this.taskToEdit, finalData))
        .then(() => {
          this.modalService.dismissAll();
          this.boardToEdit = undefined;
          this.taskToEdit = undefined;
          this.editMode = false;
        });
    } else {
      await lastValueFrom(this.dataService.createTask(this.data.project, this.data.goal, this.boardToEdit, finalData)).
        then(() => {
          this.modalService.dismissAll();
          this.boardToEdit = undefined;
        });
    }

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
