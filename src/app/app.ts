import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CaloriesCalc } from "./calories-calc-header/calories-calc-header";
import { UserCalcComponent } from "./app/user-calc/user-calc";
import { Output } from "./output/output";
import { Dashboard } from './dashboard/dashboard';
import { AiAssistant } from './ai-assistant/ai-assistant';
import { UserData } from './calc-service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CaloriesCalc, UserCalcComponent, Output, Dashboard, AiAssistant],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  userData!: UserData;
  isDark = signal(this.isBrowser ? localStorage.getItem('gym-theme') !== 'light' : true);

onUserSubmit(data: UserData) {
    this.userData = data;
  }

  toggleTheme() { this.isDark.update(value => !value); if (this.isBrowser) localStorage.setItem('gym-theme', this.isDark() ? 'dark' : 'light'); }
  protected readonly title = signal('gym-tracker');
}
