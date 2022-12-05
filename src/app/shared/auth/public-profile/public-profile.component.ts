import { Component, Input, OnInit } from '@angular/core';
import { ManagementService } from 'src/app/services/management.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {

  @Input() showName: boolean = true;
  @Input() userName: string | undefined;
  @Input() profilePic: string | undefined;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  constructor(
    public managementService: ManagementService,
  ) { }

  ngOnInit(): void {
  }

}
