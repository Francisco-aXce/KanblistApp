import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  // TODO: Add type
  @Input() data: any;
  @Input() board: any;
  @Input() canEdit?: Function;

  constructor() { }

  ngOnInit(): void {
  }

}
