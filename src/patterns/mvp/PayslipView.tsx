// ==============================================================================
// ПАТТЕРН MVP: CONCRETE VIEW (Реализация пассивного представления)
// Реализует IPayslipView. Не содержит бизнес-логики, строго следует командам Presenter
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { IPayslipView, PayslipRenderData } from './IPayslipView';
import { PayslipPresenter } from './PayslipPresenter';
import { PrintablePayslip } from '../../components/PrintablePayslip';
import {
  Calendar, Wallet, FileText, CheckCircle2, TrendingUp, Clock,
  BookOpen, AlertCircle, Printer
} from 'lucide-react';

interface PayslipViewProps {
  presenter: PayslipPresenter;
}

export const PayslipView: React.FC<PayslipViewProps> = ({ presenter }) => {
  const [periodOptions, setPeriodOptions] = useState<{ id: string; label: string }[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [payslipData, setPayslipData] = useState<PayslipRenderData | null>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Реализация методов интерфейса IPayslipView через React State
  useEffect(() => {
    const viewImplementation: IPayslipView = {
      setPeriodOptions(options, selectedId) {
        setPeriodOptions(options);
        setSelectedPeriodId(selectedId);
      },
      renderPayslip(data) {
        setPayslipData(data);
        setIsEmpty(false);
      },
      renderEmptyState() {
        setIsEmpty(true);
        setPayslipData(null);
      },
      executeBrowserPrint() {
        window.print();
      },
      displayMessage(text) {
        setInfoMessage(text);
        setTimeout(() => setInfoMessage(null), 3000);
      },
    };

    presenter.attachView(viewImplementation);
    return () => {
      presenter.detachView();
    };
  }, [presenter]);

  if (isEmpty || !payslipData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">Нет начислений</h3>
          <p className="text-sm text-slate-600 mt-2">
            Бухгалтерия еще не сформировала расчетные листки для вашего профиля.
          </p>
        </div>
      </div>
    );
  }

  const { teacher, record, settings } = payslipData;

  return (
    <div className="space-y-6">
      {/* Уведомление действий */}
      {infoMessage && (
        <div className="bg-emerald-900 text-emerald-100 border border-emerald-700/60 text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-between no-print">
          <span className="font-medium">{infoMessage}</span>
        </div>
      )}

      {/* Приветствие преподавателя и карточка периода */}
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

          {/* Селектор расчетного периода (передает событие в Presenter) */}
          <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-700/50 flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Расчетный период:
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => {
                setSelectedPeriodId(e.target.value);
                // Делегируем действие пользователя в Presenter
                presenter.onPeriodSelected(e.target.value);
              }}
              className="bg-emerald-900 text-white border border-emerald-600 text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
            >
              {periodOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Сводные показатели */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              К выплате на руки
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-white">
              {payslipData.formattedNet}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Всего начислено
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-emerald-100">
              {payslipData.formattedGross}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Нагрузка (часы)
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-white">
              {record.academicHoursWorked} ч.
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
            <div className="text-xs text-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Удержания
            </div>
            <div className="text-lg md:text-xl font-bold tabular-nums mt-1 text-rose-200">
              {payslipData.formattedDeductions}
            </div>
          </div>
        </div>
      </div>

      {/* Быстрая справка по ст. 80 ТК РБ */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs md:text-sm text-emerald-900 no-print">
        <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Конфиденциальность расчетных сведений (ст. 80 ТК РБ):</span>
          <span className="text-emerald-800 ml-1">
            Преподаватель имеет доступ исключительно к своему расчетному листку.
          </span>
        </div>
      </div>

      {/* Кнопка вызова Presenter для печати */}
      <div className="no-print flex justify-end">
        <button
          onClick={() => presenter.onPrintRequested()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          Распечатать расчетный листок
        </button>
      </div>

      {/* Официальный бланк */}
      <PrintablePayslip
        teacher={teacher}
        record={record}
        settings={settings}
        showPrintButton={false}
      />
    </div>
  );
};
