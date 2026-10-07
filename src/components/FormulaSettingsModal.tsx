import React, { useState } from 'react';
import { PayrollFormulaSettings } from '../types';
import { X, Save, Sliders, CheckCircle, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../services/storage';

interface FormulaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PayrollFormulaSettings;
  onSave: (updated: PayrollFormulaSettings) => void;
}

export const FormulaSettingsModal: React.FC<FormulaSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<PayrollFormulaSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (confirm('Сбросить формулы и ставки к стандартным значениям Республики Беларусь?')) {
      setFormData({ ...DEFAULT_SETTINGS });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold tracking-tight">
              Настройки формул и ставок оплаты труда (РБ)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Базовые реквизиты */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 border-b border-emerald-100 pb-1">
              1. Общие реквизиты колледжа
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Наименование учреждения образования:
                </label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ФИО Главного бухгалтера:
                </label>
                <input
                  type="text"
                  value={formData.chiefAccountantName}
                  onChange={(e) => setFormData({ ...formData, chiefAccountantName: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Нормативы РБ */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 border-b border-emerald-100 pb-1">
              2. Базовые нормативы Республики Беларусь
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Базовая ставка РБ (BYN):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.baseRate}
                  onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums"
                  required
                />
                <span className="text-[11px] text-slate-500">Постановление Совмина РБ</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Норма часов в месяц (СПО):
                </label>
                <input
                  type="number"
                  value={formData.standardMonthlyHours}
                  onChange={(e) => setFormData({ ...formData, standardMonthlyHours: parseInt(e.target.value) || 72 })}
                  className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500">Норма: 720 ч. в год (72 ч/мес)</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Надбавка за специфику (% от оклада):
                </label>
                <input
                  type="number"
                  value={formData.educationSectorBonusPercent}
                  onChange={(e) => setFormData({ ...formData, educationSectorBonusPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm font-semibold rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500">Сфера образования (40%)</span>
              </div>
            </div>
          </div>

          {/* Надбавки за категорию */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 border-b border-emerald-100 pb-1">
              3. Надбавки за категорию (% от базовой ставки)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Вторая категория (%):</label>
                <input
                  type="number"
                  value={formData.categoryBonusPercent.SECOND}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryBonusPercent: { ...formData.categoryBonusPercent, SECOND: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Первая категория (%):</label>
                <input
                  type="number"
                  value={formData.categoryBonusPercent.FIRST}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryBonusPercent: { ...formData.categoryBonusPercent, FIRST: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Высшая категория (%):</label>
                <input
                  type="number"
                  value={formData.categoryBonusPercent.HIGHER}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryBonusPercent: { ...formData.categoryBonusPercent, HIGHER: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Преподаватель-методист (%):</label>
                <input
                  type="number"
                  value={formData.categoryBonusPercent.METHODIST}
                  onChange={(e) => setFormData({
                    ...formData,
                    categoryBonusPercent: { ...formData.categoryBonusPercent, METHODIST: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Специальные надбавки СПО */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 border-b border-emerald-100 pb-1">
              4. Специальные надбавки и кураторство
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Кураторство группы (% от БС):
                </label>
                <input
                  type="number"
                  value={formData.curatorBonusPercentOfBaseRate}
                  onChange={(e) => setFormData({ ...formData, curatorBonusPercentOfBaseRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
                <span className="text-[11px] text-slate-500">Обычно 80%–100% БС</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Заведование кабинетом (% от БС):
                </label>
                <input
                  type="number"
                  value={formData.cabinetManagementPercentOfBaseRate}
                  onChange={(e) => setFormData({ ...formData, cabinetManagementPercentOfBaseRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
                <span className="text-[11px] text-slate-500">За учебный кабинет</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Проверка тетрадей (% от часов):
                </label>
                <input
                  type="number"
                  value={formData.writtenWorkCheckPercent}
                  onChange={(e) => setFormData({ ...formData, writtenWorkCheckPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
                <span className="text-[11px] text-slate-500">Письменные работы</span>
              </div>
            </div>
          </div>

          {/* Ставки налогов и удержаний */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 border-b border-emerald-100 pb-1">
              5. Налоги и удержания РБ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Подоходный налог (%):</label>
                <input
                  type="number"
                  value={formData.incomeTaxRate}
                  onChange={(e) => setFormData({ ...formData, incomeTaxRate: parseFloat(e.target.value) || 13 })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
                <span className="text-[10px] text-slate-500">13% в РБ</span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Взнос в ФСЗН (%):</label>
                <input
                  type="number"
                  value={formData.pensionFundRate}
                  onChange={(e) => setFormData({ ...formData, pensionFundRate: parseFloat(e.target.value) || 1 })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
                <span className="text-[10px] text-slate-500">1% пенсионный</span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Профсоюзный взнос (%):</label>
                <input
                  type="number"
                  value={formData.tradeUnionRate}
                  onChange={(e) => setFormData({ ...formData, tradeUnionRate: parseFloat(e.target.value) || 1 })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
                <span className="text-[10px] text-slate-500">1% от начислений</span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Вычет на ребенка (BYN):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.childTaxDeductionPerChild}
                  onChange={(e) => setFormData({ ...formData, childTaxDeductionPerChild: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded border border-slate-300 px-2.5 py-1.5"
                />
                <span className="text-[10px] text-slate-500">На каждого ребенка</span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс к стандарту РБ
            </button>

            <div className="flex items-center gap-3">
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
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    Сохранено!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Сохранить настройки
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
