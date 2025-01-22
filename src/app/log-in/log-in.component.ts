import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { FormControl, Validators,FormsModule, ReactiveFormsModule, } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { merge } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [HeaderComponent, 
    FooterComponent,
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    HttpClientModule,
    
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})

export class LoginComponent {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly password = new FormControl('', [Validators.required, Validators.minLength(6)]);//email input
  rememberMe = false;
  errorMessage = signal('');
  private apiBaseUrl = environment.API_BASE_URL;



  hide = signal(true); //password input
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  constructor(public router : Router, private http: HttpClient) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }

  onSubmit() {
    // Überprüfen, ob die Felder gültig sind
    if (this.email.invalid || this.password.invalid) {
      this.errorMessage.set('Bitte alle Felder korrekt ausfüllen.');
      return;
    }
  
    // Anmeldedaten abrufen
    const loginData = {
      email: this.email.value || '', // Sicherstellen, dass kein `null` übergeben wird
      password: this.password.value || ''
    };
  
    // Anfrage an das Backend senden
    this.http
      .post<any>(this.apiBaseUrl +'/api/login/', loginData)
      .subscribe({
        next: (data) => {
          console.log('Login erfolgreich:', data);
  
          if (this.rememberMe) {
            localStorage.setItem('token', data.token);
          } else {
            sessionStorage.setItem('token', data.token);
          }
  
          // Weiterleitung nach erfolgreichem Login
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Fehler beim Login:', err);
  
          // Fehlernachricht setzen
          this.errorMessage.set(
            err.error?.error || 'Ein unbekannter Fehler ist aufgetreten.'
          );
        },
        complete: () => {
          console.log('Login-Vorgang abgeschlossen.');
        }
      });
  }
   
  
}
