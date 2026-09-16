import { Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalcService, ProgressEntry } from '../calc-service';

@Component({ selector: 'app-output', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './output.html', styleUrl: './output.css' })
export class Output {
  private calcService = inject(CalcService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  userData = this.calcService.userData; results = this.calcService.results; history = this.calcService.history; progress = this.calcService.progress;
  progressDate = new Date().toISOString().slice(0, 10); progressWeight: number | null = null;
  chartPoints = computed(() => this.toPoints(this.progress()));
  addProgress() { if (this.progressWeight) { this.calcService.addProgress(this.progressDate, this.progressWeight); this.progressWeight = null; } }
  removeHistory(id: string) { this.calcService.removeHistory(id); }
  goalTitle() { return { 'lose weight': 'Cutting mode', 'maintain weight': 'Maintenance mode', 'gain weight': 'Bulking mode' }[this.userData().goal]; }
  goalTip() { return { 'lose weight': 'Keep protein high, take daily walks and focus on consistency over perfection.', 'maintain weight': 'Your target supports stable energy and performance in the gym.', 'gain weight': 'Prioritize progressive training and use carbs to support stronger sessions.' }[this.userData().goal]; }
  exportPdf() { if (this.isBrowser) window.print(); }
  exportImage() {
    if (!this.isBrowser) return;
    const r = this.results(), d = this.userData(), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1200; canvas.height = 700;
    const gradient = ctx.createLinearGradient(0, 0, 1200, 700); gradient.addColorStop(0, '#0f172a'); gradient.addColorStop(1, '#172554'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 700);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 54px Segoe UI'; ctx.fillText('Gym Tracker - Nutrition Plan', 70, 90);
    ctx.fillStyle = '#93c5fd'; ctx.font = '30px Segoe UI'; ctx.fillText(`Goal: ${d.goal} | ${d.weight} kg | ${d.trainingDays} training days/week`, 70, 145);
    const lines = [`Recommended calories: ${Math.round(r.recommendedCalories)} kcal/day`, `Protein: ${r.macros.protein} g     Carbs: ${r.macros.carbs} g     Fat: ${r.macros.fat} g`, `BMR: ${Math.round(r.bmr)} kcal     TDEE: ${Math.round(r.tdee)} kcal`, `Cutting: ${Math.round(r.comparisons['lose weight'])} kcal     Maintain: ${Math.round(r.comparisons['maintain weight'])} kcal     Bulking: ${Math.round(r.comparisons['gain weight'])} kcal`];
    ctx.fillStyle = '#e2e8f0'; ctx.font = '36px Segoe UI'; lines.forEach((line, index) => ctx.fillText(line, 70, 255 + index * 83));
    const link = document.createElement('a'); link.download = 'gym-tracker-plan.png'; link.href = canvas.toDataURL('image/png'); link.click();
  }
  private toPoints(entries: ProgressEntry[]) {
    if (entries.length < 2) return '';
    const weights = entries.map(item => item.weight), min = Math.min(...weights), max = Math.max(...weights), range = max - min || 1;
    return entries.map((item, index) => `${12 + index * (276 / (entries.length - 1))},${132 - ((item.weight - min) / range) * 108}`).join(' ');
  }
}
