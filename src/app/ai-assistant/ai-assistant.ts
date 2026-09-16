import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalcService } from '../calc-service';

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

@Component({ selector: 'app-ai-assistant', standalone: true, imports: [FormsModule], templateUrl: './ai-assistant.html', styleUrl: './ai-assistant.css' })
export class AiAssistant {
  private calc = inject(CalcService);
  messages = signal<ChatMessage[]>([{ role: 'assistant', text: 'Hi! Ask me for meal ideas, a workout split, or help using your calorie target.' }]);
  question = ''; loading = signal(false); error = signal('');
  suggestions = ['What can I eat today?', 'Create a 4-day workout plan', 'Give me a high-protein snack'];

  async ask(suggestion?: string) {
    const question = (suggestion ?? this.question).trim();
    if (!question || this.loading()) return;
    this.messages.update(items => [...items, { role: 'user', text: question }]);
    this.question = ''; this.error.set(''); this.loading.set(true);
    try {
      const response = await fetch('/api/fitness-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: this.context() }) });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error || 'Could not get an answer.');
      this.messages.update(items => [...items, { role: 'assistant', text: data.answer! }]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not get an answer.');
    } finally { this.loading.set(false); }
  }
  private context() {
    const data = this.calc.userData(), result = this.calc.results();
    if (!result.recommendedCalories) return 'The user has not calculated a nutrition plan yet.';
    return `Goal: ${data.goal}; Weight: ${data.weight} kg; Calories: ${Math.round(result.recommendedCalories)} kcal/day; Macros: protein ${result.macros.protein}g, carbs ${result.macros.carbs}g, fats ${result.macros.fat}g; Training days: ${data.trainingDays}/week.`;
  }
}
