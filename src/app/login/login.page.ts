import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form: FormGroup;
  return: string = '';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {

    this.form = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      database: ['', Validators.required]
    });
  }

  ngOnInit() {
    let settings: { database: string, login: string } = JSON.parse(localStorage.getItem('app-settings')) || {};
    this.form.patchValue({
      url: settings.database,
      login: settings.login,
    });
    // Get the query params
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/');
  }

  login() {
    const val = this.form.value;

    if (val.login && val.password && val.database) {
      this.authService.login(val.login, val.password)
        .subscribe(res => {
          if (res.jwt) {
            let settings: { database: string, login: string } = JSON.parse(localStorage.getItem('app-settings')) ||{};
            settings.database = val.database;
            settings.login = val.login;
            localStorage.setItem('app-settings', JSON.stringify(settings));
            // this.router.navigateByUrl('/');
            this.router.navigateByUrl(this.return);
          }
        }
        );
    }
  }


}
