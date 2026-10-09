// ==============================================================================
// ПАТТЕРН MVVM: VIEW (Представление рабочего места бухгалтера)
// Осуществляет Data Binding к свойствам и командам ViewModel
// ==============================================================================

import React from 'react';
import { useAccountantViewModel } from './AccountantViewModel';
import { AccountantModel } from './AccountantModel';
import { formatByn } from '../../services/calculator';
import { PayrollModal } from '../../components/PayrollModal';
import { FormulaSettingsModal } from '../../components/FormulaSettingsModal';
import { PrintablePayslip } from '../../components/PrintablePayslip';
import {
  Users, Calculator, Sliders, Plus, Search, FileDown,
  Printer, Edit2, Trash2, Eye, X, CheckCircle, Clock,
  DollarSign, Building2, UserPlus, Filter
} from 'lucide-react';

interface AccountantViewProps {
  model: AccountantModel;
}

export const AccountantView: React.FC<AccountantViewProps> = ({ model }) => {
  // Связывание View с ViewModel (Data Binding)
  const vm = useAccountantViewModel(model);

  if (vm.isLoading) {
    return <div className="text-center py-12 text-slate-500">Загрузка данных ведомости...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Баннер архитектуры MVVM */}
      <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 no-print">
        <div>
          <span className="font-bold text-emerald-800 uppercase tracking-wider mr-2">
            Паттерн: Model-View-ViewModel (MVVM)
          </span>
          <span className="text-slate-600">
            View связан с ViewModel через реактивный Data Binding • ViewModel хранит состояние и команды • Model инкапсулирует данные
          </span>
        </div>
      </div>

      {/* Шапка рабочего места бухгалтера (MVVM Data Binding к vm.settings) */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-forest-950 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              АРМ Главного бухгалтера (MVVM View)
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Расчет заработной платы преподавателей
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              {vm.settings.collegeName} (Базовая ставка: {formatByn(vm.settings.baseRate)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => vm.setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs md:text-sm font-semibold rounded-xl border border-emerald-600 transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-300" />
              Формулы и ставки (РБ)
            </button>

            <button
              onClick={() => {
                vm.setEditingRecord(null);
                vm.setIsPayrollModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs md:text-sm font-bold rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Новое начисление
            </button>
          </div>
        </div>

        {/* Сводные карточки ведомости (Связаны с vm.financialSummary) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Фонд к выплате (Net)
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-white">
              {vm.financialSummary.totalNetFormatted}
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">
              По {vm.financialSummary.count} преподавателям
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Всего начислено (Gross)
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-emerald-100">
              {vm.financialSummary.totalGrossFormatted}
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">
              Включая оклады и надбавки
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Отработано часов
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-white">
              {vm.financialSummary.totalHours} ч.
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">
              Академическая нагрузка
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Удержания и налоги
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-rose-200">
              {vm.financialSummary.totalDeductionsFormatted}
            </div>
            <div className="text-[11px] text-rose-200 mt-0.5">
              НДФЛ 13%, ФСЗН 1%, профсоюз
            </div>
          </div>
        </div>
      </div>

      {/* Переключение вкладок */}
      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => vm.setActiveTab('PAYROLLS')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              vm.activeTab === 'PAYROLLS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Сводная ведомость начислений ({vm.filteredRecords.length})
          </button>

          <button
            onClick={() => vm.setActiveTab('TEACHERS')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              vm.activeTab === 'TEACHERS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Штат преподавателей ({vm.teachers.length})
          </button>
        </div>

        {vm.activeTab === 'PAYROLLS' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => vm.exportCsvCommand()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Экспорт CSV (Command)
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Печать ведомости
            </button>
          </div>
        )}
      </div>

      {/* Вкладка начислений (Data Binding к поиску и фильтрам) */}
      {vm.activeTab === 'PAYROLLS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по ФИО или таб. №..."
                value={vm.searchQuery}
                onChange={(e) => vm.setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={vm.selectedPeriod}
                onChange={(e) => vm.setSelectedPeriod(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value="ALL">Все периоды</option>
                {vm.availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    Период: {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={vm.selectedDepartment}
                onChange={(e) => vm.setSelectedDepartment(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="ALL">Все отделения колледжа</option>
                {vm.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Найдено записей: <strong className="text-slate-800 ml-1">{vm.filteredRecords.length}</strong>
            </div>
          </div>

          {/* Таблица начислений */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm divide-y divide-slate-200">
                <thead className="bg-emerald-900 text-white font-semibold text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Преподаватель</th>
                    <th className="px-3 py-3">Период</th>
                    <th className="px-3 py-3 text-center">Часы</th>
                    <th className="px-3 py-3 text-right">Начислено</th>
                    <th className="px-3 py-3 text-right">Удержано</th>
                    <th className="px-3 py-3 text-right">Аванс</th>
                    <th className="px-4 py-3 text-right font-bold">К выплате</th>
                    <th className="px-3 py-3 text-center">Статус</th>
                    <th className="px-4 py-3 text-center no-print">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {vm.filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                        По выбранным фильтрам начисления не найдены.
                      </td>
                    </tr>
                  ) : (
                    vm.filteredRecords.map((r) => {
                      const teacher = vm.teachers.find((t) => t.id === r.teacherId);
                      return (
                        <tr key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{teacher?.fullName}</div>
                            <div className="text-[11px] text-slate-500">
                              {teacher?.tabNumber} • {teacher?.department}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-700 whitespace-nowrap">
                            {r.periodName}
                          </td>
                          <td className="px-3 py-3 text-center tabular-nums font-semibold text-emerald-800">
                            {r.academicHoursWorked} ч.
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-slate-800 font-medium">
                            {formatByn(r.grossTotal)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-rose-700 font-medium">
                            {formatByn(r.deductionsTotal)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                            {formatByn(r.advancePaid)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-extrabold text-emerald-900 bg-emerald-50/40">
                            {formatByn(r.netPayable)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                r.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'CALCULATED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status === 'PAID' ? 'Выплачено' : r.status === 'CALCULATED' ? 'Рассчитано' : 'Черновик'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center no-print whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => vm.setViewingSlipRecord(r)}
                                title="Просмотреть и распечатать расчетный листок"
                                className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  vm.setEditingRecord(r);
                                  vm.setIsPayrollModalOpen(true);
                                }}
                                title="Редактировать начисление"
                                className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => vm.deletePayrollCommand(r.id)}
                                title="Удалить начисление"
                                className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Вкладка преподавателей */}
      {vm.activeTab === 'TEACHERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-slate-800 text-sm md:text-base">
              Штатное расписание и преподаватели колледжа
            </h3>
            <button
              onClick={() => {
                vm.setEditingTeacher(null);
                vm.setIsTeacherModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs md:text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Добавить преподавателя
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vm.teachers.map((t) => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{t.fullName}</h4>
                    <span className="text-xs text-slate-500 font-mono">{t.tabNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {t.tariffRank} разряд
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Отделение:</strong> {t.department}</div>
                  <div><strong>Должность:</strong> {t.position}</div>
                  <div><strong>Категория:</strong> {t.qualificationCategory}</div>
                  <div><strong>Стаж в бюджете:</strong> {t.experienceYears} лет</div>
                  <div>
                    <strong>Кураторство:</strong>{' '}
                    {t.isGroupCurator ? <span className="text-emerald-700 font-medium">Да ({t.curatorGroupName})</span> : 'Нет'}
                  </div>
                  <div>
                    <strong>Зав. кабинетом:</strong>{' '}
                    {t.hasCabinetManagement ? <span className="text-emerald-700 font-medium">Да ({t.cabinetName})</span> : 'Нет'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      vm.setEditingTeacher(t);
                      vm.setIsTeacherModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold p-1 hover:bg-emerald-50 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Редактировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно просмотра расчетного листка */}
      {vm.viewingSlipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between no-print">
              <h2 className="text-base font-bold">
                Просмотр расчетного листка ({vm.viewingSlipRecord.periodName})
              </h2>
              <button
                onClick={() => vm.setViewingSlipRecord(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const teacher = vm.teachers.find((t) => t.id === vm.viewingSlipRecord?.teacherId);
                if (!teacher) return null;
                return (
                  <PrintablePayslip
                    teacher={teacher}
                    record={vm.viewingSlipRecord}
                    settings={vm.settings}
                    showPrintButton={true}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна */}
      <PayrollModal
        isOpen={vm.isPayrollModalOpen}
        onClose={() => vm.setIsPayrollModalOpen(false)}
        teachers={vm.teachers}
        settings={vm.settings}
        existingRecord={vm.editingRecord}
        onSave={(rec) => vm.savePayrollCommand(rec)}
      />

      <FormulaSettingsModal
        isOpen={vm.isSettingsModalOpen}
        onClose={() => vm.setIsSettingsModalOpen(false)}
        settings={vm.settings}
        onSave={(s) => vm.saveSettingsCommand(s)}
      />
    </div>
  );
};
