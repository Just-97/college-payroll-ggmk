// ==============================================================================
// ПАТТЕРН MVP: VIEW INTERFACE (Контракт пассивного представления)
// View ничего не знает о бизнес-логике, только объявляет методы для Presenter
// ==============================================================================

import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../../types';

export interface PayslipRenderData {
  teacher: Teacher;
  record: PayrollRecord;
  settings: PayrollFormulaSettings;
  formattedNet: string;
  formattedGross: string;
  formattedDeductions: string;
  categoryLabel: string;
  statusLabel: string;
}

export interface IPayslipView {
  // Presenter вызывает эти методы для обновления UI
  setPeriodOptions(periods: { id: string; label: string }[], selectedId: string): void;
  renderPayslip(data: PayslipRenderData): void;
  renderEmptyState(): void;
  executeBrowserPrint(): void;
  displayMessage(text: string, type?: 'info' | 'success' | 'warning'): void;
}
