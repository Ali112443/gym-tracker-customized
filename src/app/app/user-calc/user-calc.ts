import { Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalcService, UserData } from '../../calc-service';

type UserFormData = {
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: 'male' | 'female';
  goal: UserData['goal'];
  trainingDays: number;
  workType: UserData['workType'];
};

@Component({ selector: 'app-user-calc', standalone: true, imports: [FormsModule], templateUrl: './user-calc.html', styleUrl: './user-calc.css' })
export class UserCalcComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  private calcService = inject(CalcService);
  userData: UserFormData = { age: null, height: null, weight: null, gender: 'male', goal: 'maintain weight', trainingDays: 3, workType: 'desk' };
  @Output() submit = new EventEmitter<UserData>();
  openDialog() { this.dialog.nativeElement.showModal(); }
  onCancel() { this.dialog.nativeElement.close(); }
  onSubmit() {
    this.dialog.nativeElement.close();
    const data: UserData = {
      age: this.userData.age ?? 0,
      height: this.userData.height ?? 0,
      weight: this.userData.weight ?? 0,
      gender: this.userData.gender,
      goal: this.userData.goal,
      trainingDays: this.userData.trainingDays,
      workType: this.userData.workType,
    };
    this.submit.emit(data);
    this.calcService.userData.set(data);
    this.calcService.calculate();
  }
}