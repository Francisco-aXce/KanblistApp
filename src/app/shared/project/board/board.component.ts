import { Component, Input, OnInit } from '@angular/core';
import { Options } from 'sortablejs';
import { FireService } from 'src/app/services/fire.service';
import { ManagementService } from 'src/app/services/management.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  tasks: any[] = [];
  board: any = {};

  // TODO: Add type
  @Input() set data(data: any) {
    this.tasks = data.tasks ? [...data.tasks] : [];
    this.board = data;
  };

  @Input() canAddTask?: Function;
  @Input() canEditTask?: Function;
  @Input() canEditBoard?: Function;
  @Input() canDeleteBoard?: Function;

  tasksDndOptions: Options = {
    direction: 'vertical',
    group: {
      name: 'tasks',
    },
    onSort: (event: any) => {
      this.sortTasks();
    },
  }

  constructor(
    private fireService: FireService,
    private managementService: ManagementService,
  ) { }

  ngOnInit(): void {
  }

  async sortTasks() {
    const tasksToSet = this.tasks;

    await this.fireService.updateDoc(this.board.path, {
      tasks: tasksToSet,
    });
    this.managementService.log('sorted');
  }

}
