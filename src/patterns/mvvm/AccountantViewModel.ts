// ==============================================================================
// ПАТТЕРН MVVM: VIEWMODEL (Модель представления бухгалтера)
// Предоставляет состояние UI, вычисляемые свойства и команды для Data Binding
// ==============================================================================

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AccountantModel } from './AccountantModel';
import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../../types';
import { formatByn } from '../../services/calculator';

export function useAccountantViewModel(model: AccountantModel) {
  // Исходные данные модели
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [settings, setSettings] = useState<PayrollFormulaSettings>(() => ({
    collegeName: '',
    chiefAccountantName: '',
    baseRate: 270,
    standardMonthlyHours: 72,
    categoryBonusPercent: { NONE: 0, SECOND: 15, FIRST: 25, HIGHER: 35, METHODIST: 45 },
    experienceRules: [],
    educationSectorBonusPercent: 40,
    curatorBonusPercentOfBaseRate: 80,
    cabinetManagementPercentOfBaseRate: 20,
    writtenWorkCheckPercent: 12,
    headOfCommissionBonusPercent: 25,
    incomeTaxRate: 13,
    pensionFundRate: 1,
    tradeUnionRate: 1,
    childTaxDeductionPerChild: 51,
  }));
  const [isLoading, setIsLoading] = useState(true);

  // Свойства для Data Binding (двустороннее связывание с полями ввода View)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Сентябрь 2026');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'PAYROLLS' | 'TEACHERS'>('PAYROLLS');

  // Состояние модальных окон (UI State)
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewingSlipRecord, setViewingSlipRecord] = useState<PayrollRecord | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Загрузка данных
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const data = await model.loadAll();
    setTeachers(data.teachers);
    setRecords(data.records);
    setSettings(data.settings);
    setIsLoading(false);
  }, [model]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Вычисляемые свойства (Computed Properties)
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.periodName));
    return Array.from(set);
  }, [records]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => set.add(t.department));
    return Array.from(set);
  }, [teachers]);

  // Отфильтрованные начисления (Derived Reactive State)
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const teacher = teachers.find((t) => t.id === r.teacherId);
      if (!teacher) return false;

      const matchesPeriod = selectedPeriod === 'ALL' || r.periodName === selectedPeriod;
      const matchesDept = selectedDepartment === 'ALL' || teacher.department === selectedDepartment;
      const matchesSearch =
        teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.tabNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPeriod && matchesDept && matchesSearch;
    });
  }, [records, teachers, selectedPeriod, selectedDepartment, searchQuery]);

  // Финансовая сводка (Итоги)
  const financialSummary = useMemo(() => {
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalHours = 0;

    filteredRecords.forEach((r) => {
      totalGross += r.grossTotal;
      totalDeductions += r.deductionsTotal;
      totalNet += r.netPayable;
      totalHours += r.academicHoursWorked;
    });

    return {
      count: filteredRecords.length,
      totalGrossFormatted: formatByn(totalGross),
      totalDeductionsFormatted: formatByn(totalDeductions),
      totalNetFormatted: formatByn(totalNet),
      totalHours,
    };
  }, [filteredRecords]);

  // КОМАНДЫ (COMMANDS)
  const savePayrollCommand = async (record: PayrollRecord) => {
    await model.savePayrollRecord(record);
    await refreshData();
    setIsPayrollModalOpen(false);
  };

  const deletePayrollCommand = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить начисление?')) {
      await model.deletePayrollRecord(id);
      await refreshData();
    }
  };

  const saveSettingsCommand = async (newSettings: PayrollFormulaSettings) => {
    await model.saveSettings(newSettings);
    await refreshData();
    setIsSettingsModalOpen(false);
  };

  const saveTeacherCommand = async (teacher: Teacher) => {
    await model.saveTeacher(teacher);
    await refreshData();
    setIsTeacherModalOpen(false);
  };

  const exportCsvCommand = () => {
    const headers = ['Табельный №', 'ФИО', 'Отделение', 'Период', 'Часы', 'Начислено (BYN)', 'Удержано (BYN)', 'Аванс (BYN)', 'К выплате (BYN)', 'Статус'];
    const rows = filteredRecords.map((r) => {
      const t = teachers.find((tc) => tc.id === r.teacherId);
      return [
        t?.tabNumber || '',
        `"${t?.fullName || ''}"`,
        `"${t?.department || ''}"`,
        `"${r.periodName}"`,
        r.academicHoursWorked,
        r.grossTotal.toFixed(2),
        r.deductionsTotal.toFixed(2),
        r.advancePaid.toFixed(2),
        r.netPayable.toFixed(2),
        r.status,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ведомость_зарплаты_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // Данные и свойства для привязки
    isLoading,
    teachers,
    settings,
    searchQuery,
    setSearchQuery,
    selectedPeriod,
    setSelectedPeriod,
    selectedDepartment,
    setSelectedDepartment,
    activeTab,
    setActiveTab,
    availablePeriods,
    departments,
    filteredRecords,
    financialSummary,

    // UI состояния
    isPayrollModalOpen,
    setIsPayrollModalOpen,
    editingRecord,
    setEditingRecord,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    viewingSlipRecord,
    setViewingSlipRecord,
    isTeacherModalOpen,
    setIsTeacherModalOpen,
    editingTeacher,
    setEditingTeacher,

    // Команды
    savePayrollCommand,
    deletePayrollCommand,
    saveSettingsCommand,
    saveTeacherCommand,
    exportCsvCommand,
    refreshData,
  };
}
