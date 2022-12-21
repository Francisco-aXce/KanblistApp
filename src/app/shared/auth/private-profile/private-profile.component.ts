import { Component, Input, OnInit } from '@angular/core';
import { UserData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ManagementService } from 'src/app/services/management.service';

@Component({
  selector: 'app-private-profile',
  templateUrl: './private-profile.component.html',
  styleUrls: ['./private-profile.component.scss']
})
export class PrivateProfileComponent implements OnInit {

  @Input() userData: any;

  constructor(
    public managementService: ManagementService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
  }

}
