import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuillConfig } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { concatMap, distinctUntilKeyChanged, map, shareReplay, switchMap, take, tap, takeUntil } from 'rxjs/operators';
import { combineLatest, lastValueFrom, Subject } from 'rxjs';
import { Options } from 'sortablejs';
import { Goal } from 'src/app/models/goal.model';
import { Project } from 'src/app/models/project.model';
import { ApiService } from 'src/app/services/api.service';
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

  goalToPreview: Goal | undefined;

  // #region Main data

  goals: Goal[] = [];
  project!: Project;

  // #endregion

  goalsLoaded = false;
  loadingPreview = false;
  loadingSave = false;

  projectObs = combineLatest([
    this.route.params.pipe(distinctUntilKeyChanged('projectId')),
    this.authService.userInfo$,
  ]).pipe(
    map(([params, userInfo]) => ({
      projectPath: `users/${userInfo?.claims.uid}/projects/${params['projectId']}`,
      goalsPath: `users/${userInfo?.claims.uid}/projects/${params['projectId']}/goals`,
    })),
    switchMap((paths) => combineLatest([
      this.fireService.col$(paths.goalsPath, [this.fireService.where('active', '==', true),]),
      this.fireService.doc$(paths.projectPath).pipe(
        concatMap((projectData) => {
          // FIXME: Find a way to not make a request every time the project data changes
          return this.apiService.getUserInfo(projectData.owner.id).pipe(
            map((ownerData) => {
              return ({ ...projectData, owner: ownerData });
            }),
            take(1),
          )
        }),
      ),
    ])),
    map(([goals, projData]) => ({ goals, projData })),
    tap((data) => {
      this.managementService.log('Data project -> goal', data);
    }),
    shareReplay(1),
  );
  destroy$: Subject<boolean> = new Subject();

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
    this.loadingPreview = true;
    const goalIndex = this.goals.findIndex((g) => g.id === goal.id);
    if (goalIndex < 0) return;

    Promise.all([
      !goal.description ? this.storageService.getBlobText(`${goal.path}/description.json`) : ({ text: goal.description, success: true }),
      Object.keys(goal.attendant).length <= 1 ? lastValueFrom(this.apiService.getUserInfo(goal.attendant.id)) : null,
    ]).then((results) => {
      const desc = results[0];
      const attend = results[1];

      this.goals[goalIndex].description = desc.text;
      if (attend) this.goals[goalIndex].attendant = attend;
      this.loadingPreview = false;
    });

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
    private apiService: ApiService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.projectObs.pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.project = data.projData;
      const rawGoals = data.goals as Goal[];
      this.goals = (data.projData.goals ?? []).reduce(function (filtered: Goal[], option: Goal) {
        const finalGoal = rawGoals.find((goal) => goal.id === option.id);
        if (finalGoal) filtered.push(finalGoal);
        return filtered;
      }, []);
      this.goalsLoaded = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  openGoalModal(goal: Goal) {
    this.goalToPreview = goal;
    this.modalService.open(this.modalGoalPreview, { centered: true, size: 'xl' });
  }

  addNewGoal() {
    this.goalForm.reset();
    this.modalService.open(this.modalAddGoal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
  }

  async saveGoal() {
    this.goalForm.markAllAsTouched();
    this.loadingSave = true;
    if (this.goalForm.invalid || this.loadingPreview) return;

    const goalData = {
      name: this.name.value,
      description: this.description.value,
      order: this.goals.length,
    }

    await lastValueFrom(this.apiService.createGoal(this.project, goalData))
      .then(() => {
        this.modalService.dismissAll();
        this.goalForm.reset();
        this.loadingSave = false;
      });
  }

  async editProject() {
    this.loadingPreview = true;
    this.modalService.open(this.modalEditProject, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
    if (!this.project!.description) {
      this.project.description = await this.dataService.getProjectDesc(this.project.owner.id, this.project.id);
    }
    this.projectForm.patchValue(this.project);
    this.loadingPreview = false;
  }

  async saveProject() {
    this.projectForm.markAllAsTouched();
    this.loadingSave = true;
    if (this.projectForm.invalid || this.loadingPreview) return;

    const newData = {
      name: this.projectName.value !== this.project.name ? this.projectName.value : undefined,
      description: this.projectDescription.value !== this.project.description ? this.projectDescription.value : undefined,
    }

    if (!newData.name && !newData.description) {
      this.toastr.info('No changes made');
      return;
    }

    await lastValueFrom(this.apiService.updateProject(this.project.owner, this.project.id, newData))
      .then(() => {
        if (newData.description) this.dataService.updateLocalProjectDesc(this.project.id, newData.description);
        this.modalService.dismissAll();
        this.loadingSave = false;
      });

  }

  async sortGoals() {
    const goalsToSet = this.goals.map((goal) => ({
      id: goal.id,
    }));

    await this.fireService.updateDoc(this.project.path, {
      goals: goalsToSet,
    });
    this.managementService.log('sorted');
  }

}
