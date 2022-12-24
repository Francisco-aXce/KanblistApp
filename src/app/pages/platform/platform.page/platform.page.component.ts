import { Component, OnDestroy, OnInit } from '@angular/core';
import { Unsubscribe } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, first, of, tap, lastValueFrom } from 'rxjs';
import { gralDoc } from 'src/app/models/docs.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';

@Component({
  selector: 'app-platform.page',
  templateUrl: './platform.page.component.html',
  styleUrls: ['./platform.page.component.scss']
})
export class PlatformPageComponent implements OnInit, OnDestroy {

  projectsUnsub: Unsubscribe | undefined;
  // TODO: add model for project
  projects: any[] = [];

  readonly projectForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
  });

  get name() { return this.projectForm.get('name') as UntypedFormControl; }

  constructor(
    private fireService: FireService,
    private authService: AuthService,
    private toastr: ToastrService,
    private managementService: ManagementService,
    private dataService: DataService,
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

    const projectData = {
      name: this.name.value,
    };

    await lastValueFrom(this.dataService.createProject(projectData))
      .then(() => {
        this.projectForm.reset();
      });
  }

}
