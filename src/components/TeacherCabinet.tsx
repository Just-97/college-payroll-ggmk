import React, { useState } from 'react';
import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../types';
import { PrintablePayslip } from './PrintablePayslip';
import { formatByn } from '../services/calculator';
import { Calendar, Wallet, FileText, CheckCircle2, TrendingUp, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface TeacherCabinetProps {
  teacher: Teacher;
  records: PayrollRecord[];
  settings: PayrollFormulaSettings;
}

export const TeacherCabinet: React.FC<TeacherCabinetProps> = ({
  teacher,
  records,
  settings,
}) => {
  // Фильтруем только записи данного преподавателя
  const teacherRecords = records
    .filter((r) => r.teacherId === teacher.id)
    .sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));

  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    teacherRecords[0]?.id || ''
  );

  const currentRecord = teacherRecords.find((r) => r.id === selectedRecordId) || teacherRecords[0];

  if (!currentRecord) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">Нет начислений</h3>
          <p className="text-sm text-slate-600 mt-2">
            Бухгалтерия еще не сформировала расчетные листки для вашего табельного номера ({teacher.tabNumber}).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Приветствие и карточка преподавателя */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-medium mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Личный кабинет преподавателя
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {teacher.fullName}
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              {teacher.department} • {teacher.position} (Табельный № {teacher.tabNumber})
            </p>
          </div>

          {/* Селектор расчетного периода */}
          <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-700/50 flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Расчетный период:
            </label>
            <select
              value={currentRecord.id}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="bg-emerald-900 text-white border border-emerald-600 text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
            >
              {teacherRecords.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.periodName} ({rec.status === 'PAID' ? 'Выплачено' : 'Рассчитано'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Краткие метрики за выбранный период */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              К выплате на руки
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-white">
              {formatByn(currentRecord.netPayable)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Всего начислено
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-emerald-100">
              {formatByn(currentRecord.grossTotal)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Нагрузка (часы)
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-white">
              {currentRecord.academicHoursWorked} ч.
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Удержания
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-rose-200">
              {formatByn(currentRecord.deductionsTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Быстрая справка по правам и безопасности */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs md:text-sm text-emerald-900 no-print">
        <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Конфиденциальность расчетных сведений:</span>
          <span className="text-emerald-800 ml-1">
            В соответствии со статьей 80 ТК РБ персональные данные расчетного листка доступны только вам и уполномоченным сотрудникам бухгалтерии.
          </span>
        </div>
      </div>

      {/* Сам расчетный листок для просмотра и печати */}
      <PrintablePayslip
        teacher={teacher}
        record={currentRecord}
        settings={settings}
        showPrintButton={true}
      />
    </div>
  );
};
