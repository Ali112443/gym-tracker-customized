import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface LocalProfile { name: string; email: string; }
interface WaterLog { date: string; amount: number; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly waterGoal = 2500;
  profile = signal<LocalProfile | null>(this.read<LocalProfile | null>('gym-profile', null));
  waterAmount = signal(this.todayWater());

  saveProfile(profile: LocalProfile) { this.profile.set(profile); this.write('gym-profile', profile); }
  signOut() { this.profile.set(null); this.write('gym-profile', null); }
  addWater(amount = 250) { this.waterAmount.update(current => Math.min(this.waterGoal, current + amount)); this.write('gym-water', { date: this.today(), amount: this.waterAmount() }); }
  resetWater() { this.waterAmount.set(0); this.write('gym-water', { date: this.today(), amount: 0 }); }

  private todayWater() { const log = this.read<WaterLog | null>('gym-water', null); return log?.date === this.today() ? Math.min(this.waterGoal, log.amount) : 0; }
  private today() { return new Date().toISOString().slice(0, 10); }
  private read<T>(key: string, fallback: T): T { if (!this.isBrowser) return fallback; try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; } }
  private write(key: string, value: unknown) { if (this.isBrowser) localStorage.setItem(key, JSON.stringify(value)); }
}
