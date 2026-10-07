import React, { useState, useMemo } from 'react';
import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../types';
import { formatByn } from '../services/calculator';
import { PayrollModal } from './PayrollModal';
import { FormulaSettingsModal } from './FormulaSettingsModal';
import { PrintablePayslip } from './PrintablePayslip';
import {
  Users, Calculator, Sliders, Plus, Search, FileDown,
  Printer, Edit2, Trash2, Eye, X, CheckCircle, Clock,
  DollarSign, Building2, UserPlus, Filter
} from 'lucide-react';

interface AccountantCabinetProps {
  teachers: Teacher[];
  records: PayrollRecord[];
  settings: PayrollFormulaSettings;
  onSaveRecord: (record: PayrollRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSaveSettings: (settings: PayrollFormulaSettings) => void;
  onSaveTeacher: (teacher: Teacher) => void;
}

export const AccountantCabinet: React.FC<AccountantCabinetProps> = ({
  teachers,
  records,
  settings,
  onSaveRecord,
  onDeleteRecord,
  onSaveSettings,
  onSaveTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'PAYROLLS' | 'TEACHERS'>('PAYROLLS');

  // Фильтры
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Сентябрь 2026');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Модальные окна
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewingSlipRecord, setViewingSlipRecord] = useState<PayrollRecord | null>(null);

  // Модальное окно редактирования/добавления преподавателя
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Уникальные периоды и отделения
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

  // Фильтрация записей
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

  // Финансовая сводка по отфильтрованным записям
  const summaryMetrics = useMemo(() => {
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
      totalGross,
      totalDeductions,
      totalNet,
      totalHours,
    };
  }, [filteredRecords]);

  // Экспорт в CSV
  const handleExportCsv = () => {
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

  const handleOpenCreatePayroll = () => {
    setEditingRecord(null);
    setIsPayrollModalOpen(true);
  };

  const handleOpenEditPayroll = (rec: PayrollRecord) => {
    setEditingRecord(rec);
    setIsPayrollModalOpen(true);
  };

  const handleDeletePayroll = (id: string) => {
    if (confirm('Вы действительно хотите удалить данное начисление?')) {
      onDeleteRecord(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Шапка рабочего места бухгалтера */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-forest-950 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              АРМ Главного бухгалтера • СПО РБ
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Расчет заработной платы преподавателей
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              {settings.collegeName} (Базовая ставка: {formatByn(settings.baseRate)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs md:text-sm font-semibold rounded-xl border border-emerald-600 transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-300" />
              Формулы и ставки
            </button>

            <button
              onClick={handleOpenCreatePayroll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs md:text-sm font-bold rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Новое начисление
            </button>
          </div>
        </div>

        {/* Сводные карточки ведомости */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Фонд к выплате (Net)
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-white">
              {formatByn(summaryMetrics.totalNet)}
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5">
              По {summaryMetrics.count} преподавателям
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Всего начислено (Gross)
            </div>
            <div className="text-xl md:text-2xl font-extrabold tabular-nums mt-1 text-emerald-100">
              {formatByn(summaryMetrics.totalGross)}
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
              {summaryMetrics.totalHours} ч.
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
              {formatByn(summaryMetrics.totalDeductions)}
            </div>
            <div className="text-[11px] text-rose-200 mt-0.5">
              НДФЛ 13%, ФСЗН 1%, профсоюз
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки: Ведомость начислений / Штат преподавателей */}
      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PAYROLLS')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'PAYROLLS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Сводная ведомость начислений ({filteredRecords.length})
          </button>

          <button
            onClick={() => setActiveTab('TEACHERS')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'TEACHERS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Штат преподавателей ({teachers.length})
          </button>
        </div>

        {activeTab === 'PAYROLLS' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Экспорт CSV
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

      {/* Контент вкладки "Ведомость начислений" */}
      {activeTab === 'PAYROLLS' && (
        <div className="space-y-4">
          {/* Панель фильтров */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по ФИО или таб. №..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value="ALL">Все периоды</option>
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    Период: {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="ALL">Все отделения колледжа</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Найдено записей: <strong className="text-slate-800 ml-1">{filteredRecords.length}</strong>
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
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                        По выбранным фильтрам начисления не найдены.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const teacher = teachers.find((t) => t.id === r.teacherId);
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
                                onClick={() => setViewingSlipRecord(r)}
                                title="Просмотреть и распечатать расчетный листок"
                                className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditPayroll(r)}
                                title="Редактировать начисление"
                                className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayroll(r.id)}
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

      {/* Вкладка "Штат преподавателей" */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-slate-800 text-sm md:text-base">
              Штатное расписание и квалификация преподавателей
            </h3>
            <button
              onClick={() => {
                setEditingTeacher(null);
                setIsTeacherModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs md:text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Добавить преподавателя
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teachers.map((t) => (
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
                      setEditingTeacher(t);
                      setIsTeacherModalOpen(true);
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

      {/* Модальное окно просмотра и печати расчетного листка конкретного преподавателя */}
      {viewingSlipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between no-print">
              <h2 className="text-base font-bold">
                Просмотр расчетного листка ({viewingSlipRecord.periodName})
              </h2>
              <button
                onClick={() => setViewingSlipRecord(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const teacher = teachers.find((t) => t.id === viewingSlipRecord.teacherId);
                if (!teacher) return null;
                return (
                  <PrintablePayslip
                    teacher={teacher}
                    record={viewingSlipRecord}
                    settings={settings}
                    showPrintButton={true}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования расчета */}
      <PayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        teachers={teachers}
        settings={settings}
        existingRecord={editingRecord}
        onSave={onSaveRecord}
      />

      {/* Модальное окно настроек формул и ставок */}
      <FormulaSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={onSaveSettings}
      />

      {/* Модальное окно редактирования преподавателя */}
      {isTeacherModalOpen && (
        <TeacherEditModal
          teacher={editingTeacher}
          onClose={() => setIsTeacherModalOpen(false)}
          onSave={(t) => {
            onSaveTeacher(t);
            setIsTeacherModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Небольшое модальное окно для добавления / редактирования преподавателя
function TeacherEditModal({
  teacher,
  onClose,
  onSave,
}: {
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (t: Teacher) => void;
}) {
  const [formData, setFormData] = useState<Teacher>(
    teacher || {
      id: 't-' + Date.now(),
      fullName: '',
      tabNumber: 'ТН-' + Math.floor(100 + Math.random() * 900),
      department: 'Отделение информационных технологий',
      position: 'Преподаватель спецдисциплин',
      qualificationCategory: 'FIRST',
      experienceYears: 5,
      educationLevel: 'Высшее педагогическое',
      isGroupCurator: false,
      curatorGroupName: '',
      hasCabinetManagement: false,
      cabinetName: '',
      hasWrittenWorkCheck: false,
      isHeadOfCycleCommission: false,
      tariffRank: 9,
      isTradeUnionMember: true,
      hasChildrenTaxDeduction: false,
      childrenCount: 0,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-lg">
            {teacher ? 'Редактирование преподавателя' : 'Добавление преподавателя в штат'}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ФИО полностью:</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Табельный номер:</label>
              <input
                type="text"
                required
                value={formData.tabNumber}
                onChange={(e) => setFormData({ ...formData, tabNumber: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Тарифный разряд (8-11):</label>
              <input
                type="number"
                min="7"
                max="14"
                required
                value={formData.tariffRank}
                onChange={(e) => setFormData({ ...formData, tariffRank: parseInt(e.target.value) || 9 })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Отделение:</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Квалификационная категория:</label>
              <select
                value={formData.qualificationCategory}
                onChange={(e) => setFormData({ ...formData, qualificationCategory: e.target.value as any })}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="NONE">Без категории</option>
                <option value="SECOND">Вторая категория</option>
                <option value="FIRST">Первая категория</option>
                <option value="HIGHER">Высшая категория</option>
                <option value="METHODIST">Преподаватель-методист</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Стаж в бюджете (лет):</label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Кол-во детей (до 18 лет):</label>
              <input
                type="number"
                value={formData.childrenCount}
                onChange={(e) => setFormData({
                  ...formData,
                  childrenCount: parseInt(e.target.value) || 0,
                  hasChildrenTaxDeduction: (parseInt(e.target.value) || 0) > 0,
                })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isGroupCurator}
                onChange={(e) => setFormData({ ...formData, isGroupCurator: e.target.checked })}
              />
              <span>Куратор группы</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasCabinetManagement}
                onChange={(e) => setFormData({ ...formData, hasCabinetManagement: e.target.checked })}
              />
              <span>Заведование кабинетом</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasWrittenWorkCheck}
                onChange={(e) => setFormData({ ...formData, hasWrittenWorkCheck: e.target.checked })}
              />
              <span>Проверка тетрадей</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isHeadOfCycleCommission}
                onChange={(e) => setFormData({ ...formData, isHeadOfCycleCommission: e.target.checked })}
              />
              <span>Председатель ЦК</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100">
              Отмена
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
