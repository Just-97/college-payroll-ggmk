import { PayrollFormulaSettings } from '../types';

export const DEFAULT_SETTINGS: PayrollFormulaSettings = {
  collegeName: 'УО «Гомельский государственный машиностроительный колледж»',
  chiefAccountantName: 'Ковалёва Е.С.',
  baseRate: 270.00, // Базовая ставка в Республике Беларусь в BYN
  standardMonthlyHours: 72, // Норма часов в месяц (норма 720 ч / 10 месяцев)
  categoryBonusPercent: {
    NONE: 0,
    SECOND: 15,
    FIRST: 25,
    HIGHER: 35,
    METHODIST: 45,
  },
  experienceRules: [
    { minYears: 0, maxYears: 5, percentOfBaseRate: 10 },
    { minYears: 5, maxYears: 10, percentOfBaseRate: 15 },
    { minYears: 10, maxYears: 15, percentOfBaseRate: 20 },
    { minYears: 15, maxYears: 100, percentOfBaseRate: 30 },
  ],
  educationSectorBonusPercent: 40, // 40% от оклада за специфику работы в сфере образования
  curatorBonusPercentOfBaseRate: 80, // 80% от базовой ставки за кураторство группы
  cabinetManagementPercentOfBaseRate: 20, // 20% от базовой ставки за заведование кабинетом
  writtenWorkCheckPercent: 12, // 12% от оплаты часов за проверку тетрадей
  headOfCommissionBonusPercent: 25, // 25% от базовой ставки за руководство ЦК
  incomeTaxRate: 13, // 13% Подоходный налог в РБ
  pensionFundRate: 1, // 1% Взнос в ФСЗН с работника
  tradeUnionRate: 1, // 1% Профсоюзный взнос
  childTaxDeductionPerChild: 51.00, // 51 BYN вычет на ребенка
};
