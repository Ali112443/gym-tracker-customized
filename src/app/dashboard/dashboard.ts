import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalcService } from '../calc-service';
import { DashboardService } from '../dashboard-service';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class Dashboard {
  private calc = inject(CalcService);
  dashboard = inject(DashboardService);
  profile = this.dashboard.profile; waterAmount = this.dashboard.waterAmount; waterGoal = this.dashboard.waterGoal;
  results = this.calc.results; userData = this.calc.userData;
  showProfile = false; name = ''; email = '';
  waterPercent = computed(() => Math.round((this.waterAmount() / this.waterGoal) * 100));
  addWater() { this.dashboard.addWater(); }
  saveProfile() { if (!this.name.trim()) return; this.dashboard.saveProfile({ name: this.name.trim(), email: this.email.trim() }); this.showProfile = false; }
  signOut() { this.dashboard.signOut(); }
}
