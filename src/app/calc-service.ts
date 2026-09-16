import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Goal = 'lose weight' | 'maintain weight' | 'gain weight';
export type WorkType = 'desk' | 'light' | 'physical';
export interface UserData { age: number; weight: number; height: number; gender: 'male' | 'female'; goal: Goal; trainingDays: number; workType: WorkType; }
export interface MacroBreakdown { protein: number; carbs: number; fat: number; }
export interface Results { bmr: number; tdee: number; recommendedCalories: number; activityMultiplier: number; macros: MacroBreakdown; comparisons: Record<Goal, number>; }
export interface HistoryEntry { id: string; createdAt: string; data: UserData; result: Results; }
export interface ProgressEntry { date: string; weight: number; }

@Injectable({ providedIn: 'root' })
export class CalcService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  userData = signal<UserData>({ age: 0, weight: 0, height: 0, gender: 'male', goal: 'maintain weight', trainingDays: 3, workType: 'desk' });
  results = signal<Results>(this.emptyResults());
  history = signal<HistoryEntry[]>(this.readStorage<HistoryEntry[]>('gym-history', []));
  progress = signal<ProgressEntry[]>(this.readStorage<ProgressEntry[]>('gym-progress', []));

  calculateBmr(data: UserData): number { return 10 * data.weight + 6.25 * data.height - 5 * data.age + (data.gender === 'male' ? 5 : -161); }
  getActivityMultiplier(days: number, work: WorkType): number {
    const training = [1.2, 1.3, 1.42, 1.52, 1.62, 1.72, 1.8, 1.86][Math.max(0, Math.min(7, days))];
    const workBonus: Record<WorkType, number> = { desk: 0, light: 0.08, physical: 0.16 };
    return Math.min(1.95, training + workBonus[work]);
  }
  calculate() {
    const data = this.userData(), bmr = this.calculateBmr(data), activityMultiplier = this.getActivityMultiplier(data.trainingDays, data.workType), tdee = bmr * activityMultiplier;
    const comparisons: Record<Goal, number> = { 'lose weight': Math.max(1200, tdee - 500), 'maintain weight': tdee, 'gain weight': tdee + 300 };
    const result: Results = { bmr, tdee, recommendedCalories: comparisons[data.goal], activityMultiplier, macros: this.getMacros(data.weight, data.goal, comparisons[data.goal]), comparisons };
    this.results.set(result); this.saveCalculation(data, result);
  }
  addProgress(date: string, weight: number) {
    if (!date || !Number.isFinite(weight) || weight <= 0) return;
    const entries = [...this.progress().filter(item => item.date !== date), { date, weight }].sort((a, b) => a.date.localeCompare(b.date));
    this.progress.set(entries); this.writeStorage('gym-progress', entries);
  }
  removeHistory(id: string) { const entries = this.history().filter(item => item.id !== id); this.history.set(entries); this.writeStorage('gym-history', entries); }
  private getMacros(weight: number, goal: Goal, calories: number): MacroBreakdown {
    const proteinPerKg: Record<Goal, number> = { 'lose weight': 2.2, 'maintain weight': 1.8, 'gain weight': 2.0 };
    const protein = Math.round(weight * proteinPerKg[goal]), fat = Math.round(weight * .8), carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
    return { protein, carbs, fat };
  }
  private saveCalculation(data: UserData, result: Results) {
    const entry: HistoryEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), data: { ...data }, result };
    const entries = [entry, ...this.history()].slice(0, 20); this.history.set(entries); this.writeStorage('gym-history', entries);
  }
  private emptyResults(): Results { return { bmr: 0, tdee: 0, recommendedCalories: 0, activityMultiplier: 1.2, macros: { protein: 0, carbs: 0, fat: 0 }, comparisons: { 'lose weight': 0, 'maintain weight': 0, 'gain weight': 0 } }; }
  private readStorage<T>(key: string, fallback: T): T { if (!this.isBrowser) return fallback; try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; } }
  private writeStorage(key: string, value: unknown) { if (this.isBrowser) localStorage.setItem(key, JSON.stringify(value)); }
}
