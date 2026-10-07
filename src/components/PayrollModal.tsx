import React, { useState, useMemo } from 'react';
import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../types';
import { calculateTeacherPayroll, formatByn } from '../services/calculator';
import { X, Calculator, Check, AlertCircle } from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  settings: PayrollFormulaSettings;
  existingRecord?: PayrollRecord | null;
  onSave: (record: PayrollRecord) => void;
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  teachers,
  settings,
  existingRecord,
  onSave,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    existingRecord?.teacherId || teachers[0]?.id || ''
  );
  const [year, setYear] = useState<number>(existingRecord?.year || currentYear);
  const [month, setMonth] = useState<number>(existingRecord?.month || (currentMonth === 1 ? 12 : currentMonth));
  const [hoursWorked, setHoursWorked] = useState<number>(
    existingRecord?.academicHoursWorked ?? settings.standardMonthlyHours
  );
  const [kpiBonus, setKpiBonus] = useState<number>(existingRecord?.kpiBonus ?? 100);
  const [advancePaid, setAdvancePaid] = useState<number>(existingRecord?.advancePaid ?? 350);
  const [status, setStatus] = useState<'DRAFT' | 'CALCULATED' | 'PAID'>(
    existingRecord?.status || 'CALCULATED'
  );
  const [notes, setNotes] = useState<string>(existingRecord?.notes || '');

  // Выбранный преподаватель
  const teacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId) || teachers[0],
    [teachers, selectedTeacherId]
  );

  // Живой динамический расчет
  const preview = useMemo(() => {
    if (!teacher) return null;
    const periodName = `${MONTH_NAMES[month - 1]} ${year}`;
    return calculateTeacherPayroll({
      teacher,
      hoursWorked: Number(hoursWorked) || 0,
      kpiBonus: Number(kpiBonus) || 0,
      advancePaid: Number(advancePaid) || 0,
      year,
      month,
      periodName,
      status,
      settings,
      existingId: existingRecord?.id,
      notes,
    });
  }, [teacher, hoursWorked, kpiBonus, advancePaid, year, month, status, settings, existingRecord, notes]);

  if (!isOpen || !teacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    onSave(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold tracking-tight">
              {existingRecord ? 'Редактирование начисления' : 'Создание начисления зарплаты'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Выбор преподавателя и периода */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Преподаватель:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                disabled={!!existingRecord}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.tabNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Месяц:
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Год:
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums"
                  required
                />
              </div>
            </div>
          </div>

          {/* Карточка характеристик преподавателя */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Отделение: </span>
              <span className="font-medium text-slate-900">{teacher.department}</span>
            </div>
            <div>
              <span className="text-slate-500">Разряд / Стаж: </span>
              <span className="font-medium text-slate-900">{teacher.tariffRank} разряд / {teacher.experienceYears} лет</span>
            </div>
            <div>
              <span className="text-slate-500">Кураторство: </span>
              <span className="font-medium text-slate-900">{teacher.isGroupCurator ? (teacher.curatorGroupName || 'Да') : 'Нет'}</span>
            </div>
            <div>
              <span className="text-slate-500">Кабинет: </span>
              <span className="font-medium text-slate-900">{teacher.hasCabinetManagement ? 'Да' : 'Нет'}</span>
            </div>
          </div>

          {/* Параметры за месяц: часы, премия, аванс */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Отработано часов:
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="250"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums"
                required
              />
              <span className="text-[11px] text-slate-500">Норма: {settings.standardMonthlyHours} ч.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Премия / KPI (BYN):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kpiBonus}
                onChange={(e) => setKpiBonus(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums"
                required
              />
              <span className="text-[11px] text-slate-500">Стимулирующий фонд</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Выплачен аванс (BYN):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums"
                required
              />
              <span className="text-[11px] text-slate-500">Удерживается из остатка</span>
            </div>
          </div>

          {/* Статус и примечание */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Статус начисления:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="CALCULATED">Рассчитано (готово к выдаче)</option>
                <option value="PAID">Выплачено (деньги переведены)</option>
                <option value="DRAFT">Черновик (в процессе проверки)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Примечание бухгалтера (необязательно):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Например: доплата за замену"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ЖИВОЙ ПРЕДВАРИТЕЛЬНЫЙ ИТОГ РАСЧЕТА */}
          {preview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-700" />
                Предварительный расчет по формулам РБ
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                  <div className="text-[11px] text-slate-500">Всего начислено</div>
                  <div className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatByn(preview.grossTotal)}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                  <div className="text-[11px] text-slate-500">Всего удержано</div>
                  <div className="text-base font-bold text-rose-700 tabular-nums mt-0.5">
                    {formatByn(preview.deductionsTotal)}
                  </div>
                </div>

                <div className="bg-emerald-800 text-white p-2.5 rounded-lg shadow-sm">
                  <div className="text-[11px] text-emerald-200">К выплате на руки</div>
                  <div className="text-base font-extrabold tabular-nums mt-0.5">
                    {formatByn(preview.netPayable)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Отмена
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              {existingRecord ? 'Сохранить изменения' : 'Рассчитать и сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
