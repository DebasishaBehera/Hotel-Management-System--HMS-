import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { ChatbotComponent } from './chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('authRouteTransition', [
      transition('login <=> signup, login <=> admin-login, signup <=> admin-login', [
        query(':leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%'
          })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('360ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 0, transform: 'translateY(18px)' }))
          ], { optional: true }),
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(-14px)' }),
            animate('460ms 80ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class App {
  protected readonly title = signal('angular-frontend');

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? '';
  }
}
