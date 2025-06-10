// loader.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  styleUrls : ['./loader.component.css'],
  templateUrl: './loader.component.html'
})

export class LoaderComponent {
  loader = { show: false, message: '' };

  constructor(private loaderService: LoaderService) {
    this.loaderService.loading$.subscribe(val => this.loader = val);
  }
}
