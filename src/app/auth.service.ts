import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Moment, unix, utc } from 'moment';
import { Subject } from 'rxjs';
import { shareReplay, tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public readonly changes: Subject<{}> = new Subject<{}>();

  constructor(private http: HttpClient) {
  }

  login(account: string, password: string) {
    // return this.http.post<{ jwt: string, exp: number }>('/api/login', { account, password, realm: 'iserv' })
    return this.http.post<{ jwt: string, exp: number }>('http://localhost:8080/sphairas-login/login', { account, password, realm: 'iserv' })
      .pipe(
        tap(res => this.setSession(res)),
        shareReplay()
      );
  }

  private setSession(res) {
    localStorage.setItem('id_token', res.jwt);
    localStorage.setItem("expires_at", res.exp);
    this.changes.next();
  }

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
    const expiration: number = +localStorage.getItem("expires_at");
    const expiresAt: Moment = unix(expiration);
    return utc().isBefore(expiresAt);
  }

}
