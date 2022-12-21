import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  // TODO: add model for project
  @Input() project: any;

  constructor() { }

  ngOnInit(): void {
  }

}
