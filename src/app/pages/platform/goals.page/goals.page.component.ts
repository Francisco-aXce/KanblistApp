import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Unsubscribe } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuillConfig } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, lastValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import { Options } from 'sortablejs';
import { Goal } from 'src/app/models/projects.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-goals.page',
  templateUrl: './goals.page.component.html',
  styleUrls: ['./goals.page.component.scss']
})
export class GoalsPageComponent implements OnInit, OnDestroy {

  @ViewChild('modalGoalPreview') modalGoalPreview!: HTMLElement;
  @ViewChild('modalAddGoal') modalAddGoal!: HTMLElement;
  @ViewChild('modalEditProject') modalEditProject!: HTMLElement;

  goalsUnsub: Unsubscribe | undefined;
  goals: Goal[] = [];
  goalToPreview: Goal | undefined;

  projectInfo: any;
  projectObs = this.route.params.pipe(
    switchMap(({ projectId }) => this.authService.userInfo$.pipe(
      map((userData) => `users/${userData?.claims?.['user_id']}/projects/${projectId}`)
    )),
    switchMap((projectPath: string) => {
      return this.fireService.doc$(projectPath);
    }),
    shareReplay(1),
    tap((projData: any) => {
      this.managementService.log('Project', projData);

      this.projectInfo = {
        id: projData.id,
        name: projData.name,
        description: projData.description,
        owner: projData.owner,
        path: projData.path,
      };
    }),
  );


  quillConfig: QuillConfig = {
    format: 'json',
  };

  readonly goalForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    description: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
  });

  get name() { return this.goalForm.get('name') as UntypedFormControl; }
  get description() { return this.goalForm.get('description') as UntypedFormControl; }

  readonly projectForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    description: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
  });

  get projectName() { return this.projectForm.get('name') as UntypedFormControl; }
  get projectDescription() { return this.projectForm.get('description') as UntypedFormControl; }

  previewCallback = (goal: Goal) => {
    if (!goal.description) {
      const goalIndex = this.goals.findIndex((g) => g.id === goal.id);
      if (goalIndex < 0) return;
      this.storageService.getBlobText(`${goal.path}/description.json`)
        .then((description: { text: string, success: boolean, error?: any }) => this.goals[goalIndex].description = description.text)
    }
    this.openGoalModal(goal);
  }

  editProjCallback = () => this.editProject();

  goalsDndOptions: Options = {
    handle: '.handle',
    onUpdate: () => {
      this.sortGoals();
    },
  }

  constructor(
    private route: ActivatedRoute,
    private fireService: FireService,
    private authService: AuthService,
    private managementService: ManagementService,
    private modalService: NgbModal,
    private storageService: StorageService,
    private dataService: DataService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // In this case using promise with firstValueFrom seems to be better (faster) than using observable with first operator
    firstValueFrom(this.projectObs).then((projectData: any) => {
      if (!this.goalsUnsub) {
        this.managementService.log('setting goals unsub');
        this.goalsUnsub = this.fireService.onSnapshotCol$(`${projectData.path}/goals`,
          (goals: Goal[]) => this.getGoals(goals, projectData),
          [this.fireService.where('active', '==', true)]);
      }
    });
  }

  ngOnDestroy(): void {
    this.goalsUnsub?.();
  }

  // TODO: Fix types
  getGoals(goals: Goal[], projectData: any) {
    const goalsRaw = goals;
    const sortedGoalsIds = projectData.goals ?? [];
    const finalGoals = [];

    for (const goalInfo of sortedGoalsIds) {
      const goal = goalsRaw.find((g) => g.id === goalInfo.id);
      if (goal) finalGoals.push(goal);
    }

    this.goals = finalGoals;
    this.managementService.log('Goals final', this.goals);
  }

  openGoalModal(goal: Goal) {
    this.goalToPreview = goal;
    this.modalService.open(this.modalGoalPreview, { centered: true, size: 'xl' });
  }

  addNewGoal() {
    this.goalForm.reset();
    this.modalService.open(this.modalAddGoal, { centered: true, size: 'xl' });
  }

  async saveGoal() {
    this.goalForm.markAllAsTouched();
    if (this.goalForm.invalid) return;

    const goalData = {
      name: this.name.value,
      description: this.description.value,
      order: this.goals.length,
    }

    await lastValueFrom(this.dataService.createGoal(this.projectInfo, goalData))
      .then(() => {
        this.modalService.dismissAll();
        this.goalForm.reset();
      });
  }

  async editProject() {
    this.modalService.open(this.modalEditProject, { centered: true, size: 'xl' });
    if (!this.projectInfo.description) {
      this.projectInfo.description = await this.dataService.getProjectDesc(this.projectInfo.owner.id, this.projectInfo.id);
    }
    this.projectForm.patchValue(this.projectInfo);
  }

  async saveProject() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid) return;

    const newData = {
      name: this.projectName.value !== this.projectInfo.name ? this.projectName.value : undefined,
      description: this.projectDescription.value !== this.projectInfo.description ? this.projectDescription.value : undefined,
    }

    if (!newData.name && !newData.description) {
      this.toastr.info('No changes made');
      return;
    }

    await lastValueFrom(this.dataService.updateProject(this.projectInfo.owner, this.projectInfo.id, newData))
      .then(() => {
        if (newData.description) this.dataService.updateLocalProjectDesc(this.projectInfo.id, newData.description);
        this.modalService.dismissAll();
      });

  }

  async sortGoals() {
    const goalsToSet = this.goals.map((goal) => ({
      id: goal.id,
    }));

    await this.fireService.updateDoc(this.projectInfo.path, {
      goals: goalsToSet,
    });
    console.log('sorted');
  }

}
