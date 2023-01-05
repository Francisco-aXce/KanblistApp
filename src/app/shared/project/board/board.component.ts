import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  // TODO: Add type
  @Input() data: any;

  @Input() canAddTask?: Function;
  @Input() canEditBoard?: Function;
  @Input() canDeleteBoard?: Function;

  constructor() { }

  ngOnInit(): void {
  }

}
