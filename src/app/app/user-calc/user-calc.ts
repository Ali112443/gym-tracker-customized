import { Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalcService, UserData } from '../../calc-service';

@Component({ selector: 'app-user-calc', standalone: true, imports: [FormsModule], templateUrl: './user-calc.html', styleUrl: './user-calc.css' })
export class UserCalcComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  private calcService = inject(CalcService);
  userData: UserData = { age: 0, height: 0, weight: 0, gender: 'male', goal: 'maintain weight', trainingDays: 3, workType: 'desk' };
  @Output() submit = new EventEmitter<UserData>();
  openDialog() { this.dialog.nativeElement.showModal(); }
  onCancel() { this.dialog.nativeElement.close(); }
  onSubmit() { this.dialog.nativeElement.close(); const data = { ...this.userData }; this.submit.emit(data); this.calcService.userData.set(data); this.calcService.calculate(); }
}
