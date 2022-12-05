import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-projects-dropdown',
  templateUrl: './projects-dropdown.component.html',
  styleUrls: ['./projects-dropdown.component.scss']
})
export class ProjectsDropdownComponent implements OnInit {

  @Input() sectionName: string = 'Projects';

  constructor() { }

  ngOnInit(): void {
  }

}
