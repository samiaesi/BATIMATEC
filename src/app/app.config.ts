import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// src/app/app.config.ts

export const firebaseConfig = {
  apiKey: "AIzaSyB5BSk_VuD7ctDUnhVJLLxeZrrK0Q7hjg4",
  authDomain: "batimatec2025.firebaseapp.com",
  projectId: "batimatec2025",
  storageBucket: "batimatec2025.firebasestorage.app",
  messagingSenderId: "1072949767767",
  appId: "1:1072949767767:web:2bc6a264177432f7f4fd12",
  measurementId: "G-NBCG2T646D"
};


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
