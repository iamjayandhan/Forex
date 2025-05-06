import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserProfile } from '../models/user-profile.model';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.userSubject.asObservable(); // Observable to be used by components

  constructor(private http: HttpClient) { }

  // Fetch user profile from the backend
  getUserProfile() {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`,{withCredentials:true});
  }

  // Update user profile (e.g., fullName, etc.)
  // updateUserProfile(updatedProfile: UserProfile) {
  //   return this.http.put<UserProfile>(`${environment.apiUrl}/auth/update-profile`, updatedProfile)
  //     .pipe(
  //       tap((updated: UserProfile) => {
  //         // After update, push the updated profile to the BehaviorSubject
  //         this.setUser(updated);
  //       })
  //     );
  // }

  // Set user data into the BehaviorSubject
  setUser(user: UserProfile) {
    this.userSubject.next(user);  // Update the BehaviorSubject with the new user data
  }

  //get user
  getUser(){
    return this.userSubject.value;
  }
}
