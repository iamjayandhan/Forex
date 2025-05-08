import { Component, Input,Output,EventEmitter, OnChanges,SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotyfService } from '../services/notyf.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule]
})
export class ProfileComponent implements OnChanges{
  @Input() user: any; // user info from parent (navbar)
  @Output() close = new EventEmitter<void>();

  profileForm: FormGroup;
  showModal = false;

  constructor(
    private fb: FormBuilder, 
    private notyf: NotyfService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      fullName: [''],
      mobileNumber: [''],
      dateOfBirth: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void{
    if(changes['user'] && this.user){
      this.openModal(this.user);
    }
  }

  openModal(user: any) {
    this.showModal = true;
    this.profileForm.patchValue(user);
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    const payload = {
      email: this.profileForm.getRawValue().email,
      fullName: this.profileForm.value.fullName,
      mobileNumber: this.profileForm.value.mobileNumber,
      dateOfBirth: this.profileForm.value.dateOfBirth
    };

    this.userService.updateUserProfile(payload).subscribe({
      next: () => {
        this.notyf.success("Profile updated successfully!");
        this.closeModal();
      },
      error: (err) =>{
        this.notyf.error(err);
      },
    })
  }
}
