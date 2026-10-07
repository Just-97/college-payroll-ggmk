import React from 'react';
import { Teacher, PayrollRecord, PayrollFormulaSettings } from '../types';
import { formatByn } from '../services/calculator';
import { Printer, CheckCircle } from 'lucide-react';

interface PrintablePayslipProps {
  teacher: Teacher;
  record: PayrollRecord;
  settings: PayrollFormulaSettings;
  showPrintButton?: boolean;
}

export const PrintablePayslip: React.FC<PrintablePayslipProps> = ({
  teacher,
  record,
  settings,
  showPrintButton = true,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'HIGHER': return 'Высшая категория';
      case 'FIRST': return 'Первая категория';
      case 'SECOND': return 'Вторая категория';
      case 'METHODIST': return 'Преподаватель-методист';
      default: return 'Без категории (соотв. должности)';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 md:p-8 text-slate-800 print-container">
      {/* Кнопка печати (скрывается при печати) */}
      {showPrintButton && (
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              {record.status === 'PAID' ? 'Выплачено' : 'Рассчитано'}
            </span>
            <span className="text-sm text-slate-500">
              Период: <strong className="text-slate-700">{record.periodName}</strong>
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <Printer className="w-4 h-4" />
            Распечатать расчетный листок
          </button>
        </div>
      )}

      {/* ОФИЦИАЛЬНЫЙ БЛАНК РАСЧЕТНОГО ЛИСТКА (РБ, ст. 80 ТК РБ) */}
      <div className="print-content text-xs md:text-sm">
        {/* Шапка организации */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-4">
          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight uppercase">
            {settings.collegeName}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            РАСЧЕТНЫЙ ЛИСТОК ЗА <span className="font-bold uppercase text-slate-900">{record.periodName}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            В соответствии со статьей 80 Трудового кодекса Республики Беларусь
          </p>
        </div>

        {/* Данные сотрудника */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 py-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500">Сотрудник (ФИО): </span>
            <strong className="text-slate-900">{teacher.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500">Табельный номер: </span>
            <strong className="text-slate-900">{teacher.tabNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500">Подразделение: </span>
            <span className="text-slate-800">{teacher.department}</span>
          </div>
          <div>
            <span className="text-slate-500">Должность: </span>
            <span className="text-slate-800">{teacher.position}</span>
          </div>
          <div>
            <span className="text-slate-500">Квалификация: </span>
            <span className="text-slate-800 font-medium">{getCategoryLabel(teacher.qualificationCategory)}</span>
          </div>
          <div>
            <span className="text-slate-500">Пед. стаж / Разряд: </span>
            <span className="text-slate-800">{teacher.experienceYears} лет / {teacher.tariffRank} разряд</span>
          </div>
          <div>
            <span className="text-slate-500">Отработано часов: </span>
            <strong className="text-emerald-800">{record.academicHoursWorked} ч.</strong>
            <span className="text-slate-400 text-xs ml-1">(при норме {settings.standardMonthlyHours} ч/мес)</span>
          </div>
          <div>
            <span className="text-slate-500">Базовая ставка РБ: </span>
            <span className="text-slate-800">{formatByn(settings.baseRate)}</span>
          </div>
        </div>

        {/* Таблицы Начислений и Удержаний */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 1. НАЧИСЛЕНО */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-emerald-800 text-white px-3 py-1.5 font-semibold text-xs uppercase tracking-wider flex justify-between">
              <span>Вид начисления</span>
              <span>Сумма (BYN)</span>
            </div>
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">
                    Оплата за часы ({record.academicHoursWorked} ч.)
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                    {formatByn(record.tariffSalary)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">
                    Специфика сферы образования ({settings.educationSectorBonusPercent}%)
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                    {formatByn(record.specificEducationBonus)}
                  </td>
                </tr>

                {record.categoryBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Надбавка за категорию</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.categoryBonus)}
                    </td>
                  </tr>
                )}

                {record.experienceBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Стаж в бюджетных организациях</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.experienceBonus)}
                    </td>
                  </tr>
                )}

                {record.curatorBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">
                      Кураторство учебной группы {teacher.curatorGroupName ? `(${teacher.curatorGroupName})` : ''}
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.curatorBonus)}
                    </td>
                  </tr>
                )}

                {record.cabinetBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Заведование кабинетом/лабораторией</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.cabinetBonus)}
                    </td>
                  </tr>
                )}

                {record.writtenWorkBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Проверка письменных работ</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.writtenWorkBonus)}
                    </td>
                  </tr>
                )}

                {record.headOfCommissionBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Руководство цикловой комиссией</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.headOfCommissionBonus)}
                    </td>
                  </tr>
                )}

                {record.kpiBonus > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Стимулирующая выплата / Премия</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.kpiBonus)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50 border-t-2 border-emerald-800 font-bold text-emerald-950">
                  <td className="px-3 py-2 uppercase">Всего начислено:</td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-900">
                    {formatByn(record.grossTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. УДЕРЖАНО */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-rose-900 text-white px-3 py-1.5 font-semibold text-xs uppercase tracking-wider flex justify-between">
              <span>Вид удержания</span>
              <span>Сумма (BYN)</span>
            </div>
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">
                    Подоходный налог ({settings.incomeTaxRate}%)
                    {teacher.hasChildrenTaxDeduction && (
                      <span className="block text-[10px] text-slate-500">
                        (с учетом вычета на {teacher.childrenCount} детей)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                    {formatByn(record.incomeTax)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">
                    Взнос в ФСЗН ({settings.pensionFundRate}%, пенсионный)
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                    {formatByn(record.pensionFund)}
                  </td>
                </tr>

                {record.tradeUnion > 0 && (
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-1.5">Профсоюзный взнос ({settings.tradeUnionRate}%)</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                      {formatByn(record.tradeUnion)}
                    </td>
                  </tr>
                )}

                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-1.5">Выплаченный аванс</td>
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                    {formatByn(record.advancePaid)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-rose-50 border-t-2 border-rose-900 font-bold text-rose-950">
                  <td className="px-3 py-2 uppercase">Всего удержано:</td>
                  <td className="px-3 py-2 text-right tabular-nums text-rose-900">
                    {formatByn(record.deductionsTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ИТОГОВАЯ СУММА К ВЫПЛАТЕ */}
        <div className="bg-emerald-900 text-white p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 my-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
              Сумма к перечислению на счет (на руки)
            </div>
            <div className="text-[11px] text-emerald-300">
              Всего начислено ({formatByn(record.grossTotal)}) минус все удержания и аванс ({formatByn(record.deductionsTotal)})
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight text-white text-right">
            {formatByn(record.netPayable)}
          </div>
        </div>

        {/* Примечание бухгалтерии, если есть */}
        {record.notes && (
          <div className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded border border-amber-200 mb-4">
            <strong>Примечание бухгалтерии:</strong> {record.notes}
          </div>
        )}

        {/* Подписи сторон (Обязательно для расчетного листка) */}
        <div className="mt-8 pt-4 border-t border-slate-400 grid grid-cols-2 gap-8 text-xs text-slate-700">
          <div>
            <p>Главный бухгалтер:</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-32 border-b border-slate-400 inline-block"></span>
              <span className="font-semibold text-slate-900">/{settings.chiefAccountantName}/</span>
            </div>
          </div>

          <div>
            <p>С расчетным листком ознакомлен:</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-32 border-b border-slate-400 inline-block"></span>
              <span className="font-semibold text-slate-900">/{teacher.fullName}/</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
