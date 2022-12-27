import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  // TODO: add model for project
  @Input() project: any;
  @Input() canPreview: Function | undefined;

  constructor(
    public dataService: DataService,
  ) { }

  ngOnInit(): void {
  }

}
