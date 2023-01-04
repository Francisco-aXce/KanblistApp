import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-header',
  templateUrl: './project-header.component.html',
  styleUrls: ['./project-header.component.scss']
})
export class ProjectHeaderComponent implements OnInit {

  @Input() projectName: string = 'Project name';
  @Input() ownerName: string = 'Project owner';
  @Input() canEdit?: Function;

  constructor() { }

  ngOnInit(): void {
  }

}
