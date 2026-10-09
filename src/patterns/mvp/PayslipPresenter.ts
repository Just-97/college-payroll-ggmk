// ==============================================================================
// ПАТТЕРН MVP: PRESENTER (Презентер расчетного листка)
// Управляет логикой отображения, форматирует данные и вызывает методы IPayslipView
// ==============================================================================

import { PayrollModel } from './PayrollModel';
import { IPayslipView, PayslipRenderData } from './IPayslipView';
import { formatByn } from '../../services/calculator';
import { QualificationCategory } from '../../types';

export class PayslipPresenter {
  private model: PayrollModel;
  private view: IPayslipView | null = null;
  private currentRecordId: string | null = null;

  constructor(model: PayrollModel) {
    this.model = model;
  }

  // Привязка представления (Passive View)
  public attachView(view: IPayslipView): void {
    this.view = view;
    this.initViewData();
  }

  public detachView(): void {
    this.view = null;
  }

  // Инициализация данных во View
  public initViewData(): void {
    if (!this.view) return;

    this.model.refreshData();
    const records = this.model.getTeacherRecords();

    if (records.length === 0) {
      this.view.renderEmptyState();
      return;
    }

    const options = records.map((r) => ({
      id: r.id,
      label: `${r.periodName} (${r.status === 'PAID' ? 'Выплачено' : 'Рассчитано'})`,
    }));

    const selectedId = this.currentRecordId || records[0].id;
    this.currentRecordId = selectedId;

    this.view.setPeriodOptions(options, selectedId);
    this.updatePayslipDisplay(selectedId);
  }

  // Пользовательское событие: смена периода
  public onPeriodSelected(recordId: string): void {
    this.currentRecordId = recordId;
    this.updatePayslipDisplay(recordId);
  }

  // Пользовательское событие: запрос печати
  public onPrintRequested(): void {
    if (!this.view) return;
    this.view.executeBrowserPrint();
    this.view.displayMessage('Формирование официального расчетного листа для печати (А4)...', 'info');
  }

  // Подготовка данных и передача во View
  private updatePayslipDisplay(recordId: string): void {
    if (!this.view) return;

    const record = this.model.getRecordById(recordId);
    if (!record) {
      this.view.renderEmptyState();
      return;
    }

    const teacher = this.model.getTeacher();
    const settings = this.model.getSettings();

    const renderData: PayslipRenderData = {
      teacher,
      record,
      settings,
      formattedNet: formatByn(record.netPayable),
      formattedGross: formatByn(record.grossTotal),
      formattedDeductions: formatByn(record.deductionsTotal),
      categoryLabel: this.getCategoryLabel(teacher.qualificationCategory),
      statusLabel: record.status === 'PAID' ? 'Выплачено' : 'Рассчитано',
    };

    this.view.renderPayslip(renderData);
  }

  private getCategoryLabel(category: QualificationCategory): string {
    switch (category) {
      case 'HIGHER': return 'Высшая категория';
      case 'FIRST': return 'Первая категория';
      case 'SECOND': return 'Вторая категория';
      case 'METHODIST': return 'Преподаватель-методист';
      default: return 'Без категории (соответствие должности)';
    }
  }
}
