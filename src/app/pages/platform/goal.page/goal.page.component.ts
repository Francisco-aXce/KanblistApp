import { Component, OnInit, ViewChild } from '@angular/core';
import { Unsubscribe } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, firstValueFrom } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Options } from 'sortablejs';
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

  editMode = false;
  boardToEdit?: any;

  goalInfo: any;
  projectObs = this.route.params.pipe(
    switchMap(({ projectId, goalId }) => this.authService.userInfo$.pipe(
      map((user) => ({ projectId, goalId, claims: user?.claims, }))
    )),
    switchMap(({ projectId, goalId, claims }) => {
      const projectPath = `users/${claims?.['user_id']}/projects/${projectId}`;
      return combineLatest([
        this.fireService.doc$(projectPath),
        this.fireService.doc$(`${projectPath}/goals/${goalId}`),
      ]).pipe(
        map(([project, goal]) => ({ project, goal, claims })),
      );
    }),
    shareReplay(1),
    tap((data) => {
      this.managementService.log('GoalPageComponent', 'projectObs', data);

      this.goalInfo = {
        path: data.goal.path,
      };
    }),
  );
  boardsUnsub?: Unsubscribe;

  // TODO: Add type
  boards: any[] = [];

  readonly boardForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(17)]),
  });

  get name() { return this.boardForm.get('name') as UntypedFormControl; }

  editBoardCallback = (board: any) => {
    this.onEditBoard(board);
  };

  boardsDndOptions: Options = {
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
  ) { }

  ngOnInit(): void {
    firstValueFrom(this.projectObs).then(({ goal }) => {
      if (!this.boardsUnsub) {
        this.managementService.log('setting boards unsub');
        this.boardsUnsub = this.fireService.onSnapshotCol$(`${goal.path}/boards`,
          (boards: any[]) => this.getBoards(boards, goal),
          [this.fireService.where('active', '==', true)]);
      }
    });
  }

  ngOnDestroy(): void {
    this.boardsUnsub?.();
  }

  // TODO: Add type
  // FIXME: Repetitive code with goals
  getBoards(boards: any[], goal: any) {
    const boardsRaw = boards;
    const sortedBoardsIds = goal.boards ?? [];
    const finalBoards = [];

    for (const boardInfo of sortedBoardsIds) {
      const board = boardsRaw.find((b) => b.id === boardInfo.id);
      if (board) finalBoards.push(board);
    }

    this.boards = finalBoards;
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
    if (this.boardForm.invalid) return;

    await setTimeout(() => {
      console.log('Board saved');
      this.modalService.dismissAll();
      this.editMode = false;
    }, 1000);

    // this.modalService.dismissAll();
  }

  sortBoards() {
    console.log('Sorting boards', this.goalInfo);
  }

}
