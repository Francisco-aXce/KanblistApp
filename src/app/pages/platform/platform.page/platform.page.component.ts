import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Unsubscribe } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, OperatorFunction, of, lastValueFrom, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, tap } from 'rxjs/operators';
import { gralDoc } from 'src/app/models/docs.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { defaultImage, validImages } from 'src/assets/Projects/valid-images.project';

@Component({
  selector: 'app-platform.page',
  templateUrl: './platform.page.component.html',
  styleUrls: ['./platform.page.component.scss']
})
export class PlatformPageComponent implements OnInit, OnDestroy {

  projectsUnsub: Unsubscribe | undefined;
  // TODO: add model for project
  projects: any[] = [];

  projectToPreview: any | undefined;

  @ViewChild('modalNewProject') modalNewProject!: HTMLElement;
  @ViewChild('modalProjectPreview') modalProjectPreview!: HTMLElement;

  readonly newPCallback = () => {
    this.projectForm.reset();
    this.modalService.open(this.modalNewProject, { centered: true, size: 'xl' });
  };

  readonly previewPCallback = (project: any) => {
    this.projectToPreview = project;
    this.modalService.open(this.modalProjectPreview, { centered: true, size: 'xl' });
  };

  readonly projectForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    image: new UntypedFormControl('', [Validators.required]),
  });

  get name() { return this.projectForm.get('name') as UntypedFormControl; }
  get image() { return this.projectForm.get('image') as UntypedFormControl; }

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

  constructor(
    private fireService: FireService,
    private authService: AuthService,
    private toastr: ToastrService,
    private managementService: ManagementService,
    public dataService: DataService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.authService.userInfo$.pipe(
      filter((userData) => !!userData),
      first(),
      tap((userData) => {
        const userId: string | undefined = userData?.claims?.['user_id'];
        if (!userData || !userId) {
          this.toastr.error('Please login first', 'Error');
          return;
        }

        this.projectsUnsub = this.fireService.onSnapshotCol$(`users/${userId}/projects`,
          (docs: gralDoc[]) => this.getProjects(docs),
          [this.fireService.orderBy('createdAt', 'desc'), this.fireService.where('active', '==', true)]);

      }),
      catchError((error) => {
        this.toastr.error('Error while getting user data', 'Error');
        this.managementService.error(error);
        return of(null);
      }),
    ).subscribe();

  }

  ngOnDestroy(): void {
    if (this.projectsUnsub) this.projectsUnsub();
  }

  private getProjects(projects: gralDoc[]) {
    this.projects = projects;
    this.managementService.log('Projects: ', this.projects);
  }

  async saveProject() {
    if (this.projectForm.invalid) return;

    // Just to make sure a valid image is selected and to handle default selection
    if (!this.image.value || !validImages.includes(this.image.value)) this.projectForm.get('image')?.setValue(defaultImage);

    const projectData = {
      name: this.name.value,
      image: this.image.value,
    };

    await lastValueFrom(this.dataService.createProject(projectData))
      .then(() => {
        this.modalService.dismissAll();
        this.projectForm.reset();
      });
  }

}
