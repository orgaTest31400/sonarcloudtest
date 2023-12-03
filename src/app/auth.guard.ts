import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './services/login.service';
import { TypeProfil } from './enum/type-profil';


export const AuthGuard =
  async () => {
    const loginService = inject(LoginService);
    const router = inject(Router);
    if (!await loginService.isAuthenticated()) {
      loginService.setUser();
      router.navigate(['/connexion']);
      return false;
    }
    return true;
  };


export const AuthType =
  () => {
    const loginService = inject(LoginService);
    const router = inject(Router);
    if (loginService.getUserType() == TypeProfil.VACATAIRE) {
      router.navigate([`/vacataires/profil/${loginService.getId()}`]);
    }
    return loginService.getUserType() == TypeProfil.RESPONSABLE_VACATAIRES;
  };
