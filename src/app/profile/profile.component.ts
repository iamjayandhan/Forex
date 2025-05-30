// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../models/user-profile.model'; // Your interface
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { NotyfService } from '../services/notyf.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone:true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ProfileComponent implements OnInit {
  user!: UserProfile;
  profileForm!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder, private userService: UserService, private notyf: NotyfService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.currentUser$.subscribe(userData => {
      if (userData) {
        this.user = userData;
        this.initForm();
      }
    });
    this.userService.getUserProfile().subscribe(res => {
      this.userService.setUser(res.data);
    });
  }

  initForm() {
    this.profileForm = this.fb.group({
      fullName: [this.user.fullName, Validators.required],
      dateOfBirth: [this.user.dateOfBirth, Validators.required],
      mobileNumber: [this.user.mobileNumber, Validators.required]
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initForm(); // Reset form with current user data when entering edit mode
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const updatedProfile = {
      ...this.user,
      fullName: this.profileForm.value.fullName,
      dateOfBirth: this.profileForm.value.dateOfBirth,
      mobileNumber: this.profileForm.value.mobileNumber
    };

    this.userService.updateUserProfile(updatedProfile).subscribe(() => {
      this.user = updatedProfile;
      this.isEditing = false;
      this.notyf.success("Profile updated successfully.");
    });
  }
}
