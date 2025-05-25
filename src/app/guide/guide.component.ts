import { Component, OnInit} from '@angular/core';
import { UserProfile } from '../models/user-profile.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-guide',
  imports: [],
  standalone: true,
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.css'
})
export class GuideComponent implements OnInit {
  user: UserProfile | null = null;

  constructor(
    private userService: UserService
  ){}

  ngOnInit(): void {
    if(!this.userService.getUser()){
      //fetch from API
      this.userService.getUserProfile().subscribe((res) => {
        this.userService.setUser(res.data);
      });
    }
    //subscribe to the BehaviorSubject
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
    })
  }
}
