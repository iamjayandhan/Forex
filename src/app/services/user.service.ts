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

  // Update user profile (fullname, DOB, mobile)
  updateUserProfile(updatedProfile: any) {
    return this.http.post<any>(`${environment.apiUrl}/auth/update`, updatedProfile,{ withCredentials:true})
      .pipe(
        tap((updated: any) => {
          // After update, push the updated profile to the BehaviorSubject
          this.setUser(updated);
        })
      );
  }

  // Set user data into the BehaviorSubject
  setUser(user: UserProfile) {
    this.userSubject.next(user);  // Update the BehaviorSubject with the new user data
    //since value of userSubject is updated, all subscribers will get the new value! only happens when used next()
  }

  //get user
  getUser(){
    return this.userSubject.value;
  }

  //balance update
  updateWallet(data: {email: string, amount: number, operation: string}) {
    return this.http.post<any>(`${environment.apiUrl}/auth/balance`,data, { withCredentials: true });
  }
}
