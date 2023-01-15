import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subject, OperatorFunction, lastValueFrom, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { defaultImage, validImages } from 'src/assets/Projects/valid-images.project';
import { Project } from 'src/app/models/project.model';
import { QuillConfig } from 'ngx-quill/config';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-platform.page',
  templateUrl: './platform.page.component.html',
  styleUrls: ['./platform.page.component.scss']
})
export class PlatformPageComponent implements OnInit, OnDestroy {

  projectToPreview: any | undefined;

  projectsLoaded = false;
  loadingSave = false;

  // #region Main data

  projects: Project[] = [];

  // #endregion

  @ViewChild('modalNewProject') modalNewProject!: HTMLElement;
  @ViewChild('modalProjectPreview') modalProjectPreview!: HTMLElement;

  readonly destroy$: Subject<boolean> = new Subject();
  projectObs$: Observable<Project[]> = this.authService.userInfo$.pipe(
    filter((user) => !!user),
    switchMap((user) => this.fireService.col$(`users/${user!.claims.uid}/projects`,
      [this.fireService.where('active', '==', true), this.fireService.orderBy('createdAt', 'desc'),
      ]) as Observable<Project[]>),
    catchError((error) => {
      this.managementService.error('Error while loading projects', error);
      return [];
    }),
    shareReplay(1),
  )

  readonly newPCallback = () => {
    this.projectForm.reset();
    this.modalService.open(this.modalNewProject, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
  };

  readonly previewPCallback = (project: any) => {
    this.projectToPreview = project;
    this.modalService.open(this.modalProjectPreview, { centered: true, size: 'xl' });

    lastValueFrom(this.apiService.getUserInfo(project.owner.id))
      .then((user) => user && (project.owner = user));

    this.dataService.getProjectDesc(project.owner.id, project.id)
      .then((desc) => {
        project.description = desc;
      });
  };

  readonly projectForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    image: new UntypedFormControl(''),
    description: new UntypedFormControl('', [Validators.required, Validators.minLength(1)]),
  });

  get name() { return this.projectForm.get('name') as UntypedFormControl; }
  get image() { return this.projectForm.get('image') as UntypedFormControl; }
  get description() { return this.projectForm.get('description') as UntypedFormControl; }

  // #region Search image input
  focus$ = new Subject<string>();

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$).pipe(
      map((term) => !term?.length ? validImages : validImages.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)),
    );
  };
  // #endregion

  // #region Quill

  quillConfig: QuillConfig = {
    format: 'json',
  };

  // #endregion

  constructor(
    private fireService: FireService,
    private authService: AuthService,
    private managementService: ManagementService,
    public dataService: DataService,
    private apiService: ApiService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.projectObs$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((projects) => {
        this.projectsLoaded = true;
        this.projects = projects;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  async saveProject() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid) return;
    this.loadingSave = true;

    // Just to make sure a valid image is selected and to handle default selection
    if (!this.image.value || !validImages.includes(this.image.value)) this.projectForm.get('image')?.setValue(defaultImage);

    const projectData = {
      name: this.name.value,
      image: this.image.value,
      description: this.description.value,
    };

    await lastValueFrom(this.apiService.createProject(projectData))
      .then(() => {
        this.modalService.dismissAll();
        this.projectForm.reset();
      })
      .catch((err) => {
        this.managementService.error('Error while creating project', err);
        const userMessage = err?.error?.success !== undefined ? err.error.message : 'Error while creating project';
        this.managementService.toastError(userMessage);
      });
    this.loadingSave = false;
  }

}
