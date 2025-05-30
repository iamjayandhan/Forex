import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { NotyfService } from './services/notyf.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule,RouterOutlet,NavbarComponent],
})

export class AppComponent implements OnInit {
  title = 'Angular Authentication Demo';

  showNavbar = true;

  constructor(private router: Router, private notyf:NotyfService){
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd){
        const hiddenRoutes = ['/login','/register','/resetPwd','/home'];
        this.showNavbar = !hiddenRoutes.includes(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(){
    this.updateOnlineStatus();
  }

  updateOnlineStatus(){
    if(navigator.onLine){
      return;
    }
    else{
      this.notyf.error("We are offline! Please try again after sometime.");
      console.log("offline buddy.");
    }
  }

}
