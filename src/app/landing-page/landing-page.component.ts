import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  constructor(private router: Router){}

  landingLinks = [
    { label: '', route: '' },
  ];

  activeRoute = 'home'; // Update this based on routing logic

  navigateTo(route: string) {
    this.activeRoute = route;
    this.router.navigate([route]);
  }
}
