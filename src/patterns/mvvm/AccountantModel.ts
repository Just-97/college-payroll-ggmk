// ==============================================================================
// ПАТТЕРН MVVM: MODEL (Доменная модель рабочего места бухгалтера)
// ==============================================================================

import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { DatabaseService } from '../../services/supabase';

export class AccountantModel {
  public async loadAll(): Promise<{
    teachers: Teacher[];
    records: PayrollRecord[];
    settings: PayrollFormulaSettings;
  }> {
    // Сначала пробуем загрузить из Supabase, затем из StorageService
    const [dbTeachers, dbPayrolls, dbSettings] = await Promise.all([
      DatabaseService.getTeachers(),
      DatabaseService.getPayrolls(),
      DatabaseService.getSettings(),
    ]);

    const teachers = dbTeachers || StorageService.getTeachers();
    const records = dbPayrolls || StorageService.getPayrolls();
    const settings = dbSettings || StorageService.getSettings();

    return { teachers, records, settings };
  }

  public async savePayrollRecord(record: PayrollRecord): Promise<void> {
    StorageService.savePayroll(record);
    await DatabaseService.savePayroll(record);
  }

  public async deletePayrollRecord(id: string): Promise<void> {
    StorageService.deletePayroll(id);
    await DatabaseService.deletePayroll(id);
  }

  public async deleteTeacher(id: string): Promise<void> {
    StorageService.deleteTeacher(id);
    await DatabaseService.deleteTeacher(id);
  }


  public async saveSettings(settings: PayrollFormulaSettings): Promise<void> {
    StorageService.saveSettings(settings);
    await DatabaseService.saveSettings(settings);
  }

  public async saveTeacher(teacher: Teacher): Promise<void> {
    StorageService.saveTeacher(teacher);
    await DatabaseService.saveTeacher(teacher);
  }
}
