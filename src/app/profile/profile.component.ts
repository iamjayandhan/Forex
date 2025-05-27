import { Component, Input,Output,EventEmitter, OnChanges,SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotyfService } from '../services/notyf.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule]
})
export class ProfileComponent implements OnInit{

  profileForm: FormGroup;
  showModal = false;
  user: UserProfile | null = null;

  constructor(
    private fb: FormBuilder, 
    private notyf: NotyfService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      fullName: ['',Validators.required],
      mobileNumber: ['',[Validators.required, Validators.pattern('^[1-9][0-9]{9}$')]],
      dateOfBirth: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
        this.profileForm.patchValue({
          email: userData.email,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          dateOfBirth: userData.dateOfBirth
        });
      }
    });

    // Fetch if user data is not already available
    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((data) => {
        this.userService.setUser(data);
      });
    }
  }

  onSubmit() {
    const payload = {
      email: this.profileForm.getRawValue().email,
      fullName: this.profileForm.value.fullName,
      mobileNumber: this.profileForm.value.mobileNumber,
      dateOfBirth: this.profileForm.value.dateOfBirth
    };

    console.log("Payload for update:", payload);

    this.userService.updateUserProfile(payload).subscribe({
      next: () => {
        // this.notyf.success("Profile updated successfully!");
      },
      error: (err) =>{
        this.notyf.error(err);
      },
    })
  }

  onCancel() {
    this.showModal = false;

    const role = this.userService.getUser()?.role;

    if( role === 'ADMIN'){
      this.router.navigate(['/admin']);
    }
    else{
      this.router.navigate(['/portfolio']);
    }
  }
}
