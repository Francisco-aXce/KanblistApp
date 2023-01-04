import { Component, Input } from '@angular/core';
import { Goal } from 'src/app/models/projects.model';

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss']
})
export class GoalCardComponent {

  @Input() data?: Goal;
  @Input() canPreview?: Function;

}
