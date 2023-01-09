import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-header',
  templateUrl: './project-header.component.html',
  styleUrls: ['./project-header.component.scss']
})
export class ProjectHeaderComponent implements OnInit {

  @Input() set projectData(value: any) {
    this.data = value;
    if (!value?.owner?.photo) {
      Object.assign(this.data.owner, { photo: './../../../../assets/nouser.svg' });
    }
  };
  @Input() canEdit?: Function;

  data: any;

  constructor() { }

  ngOnInit(): void {
  }

}
