// ==============================================================================
// ПАТТЕРН MVP: MODEL (Модель начислений заработной платы)
// Содержит бизнес-логику хранения и выборки данных для конкретного педагога
// ==============================================================================

import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../../types';
import { StorageService } from '../../services/storage';

export class PayrollModel {
  private teacher: Teacher;
  private records: PayrollRecord[] = [];
  private settings: PayrollFormulaSettings;

  constructor(teacher: Teacher, settings?: PayrollFormulaSettings) {
    this.teacher = teacher;
    this.settings = settings || StorageService.getSettings();
    this.refreshData();
  }

  public refreshData(): void {
    const all = StorageService.getPayrolls();
    this.records = all
      .filter((r) => r.teacherId === this.teacher.id)
      .sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
  }

  public getTeacher(): Teacher {
    return this.teacher;
  }

  public getSettings(): PayrollFormulaSettings {
    return this.settings;
  }

  public getTeacherRecords(): PayrollRecord[] {
    return [...this.records];
  }

  public getRecordById(id: string): PayrollRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  public getLatestRecord(): PayrollRecord | undefined {
    return this.records[0];
  }
}
