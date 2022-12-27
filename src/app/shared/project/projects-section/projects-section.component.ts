import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.scss']
})
export class ProjectsSectionComponent implements OnInit {

  //TODO: Add model for projects
  @Input() projects: any = [];
  @Input() sectionName!: string;
  @Input() emptyMessage = 'Nothing to show here';
  @Input() icon?: string;
  @Input() canAdd: Function | undefined;
  @Input() canPreview: Function | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
