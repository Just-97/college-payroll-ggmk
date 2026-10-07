import { Teacher, PayrollFormulaSettings, PayrollRecord } from '../types';

export function roundByn(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatByn(amount: number): string {
  return new Intl.NumberFormat('ru-BY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' руб.';
}

export function calculateTeacherPayroll(params: {
  teacher: Teacher;
  hoursWorked: number;
  kpiBonus: number;
  advancePaid: number;
  year: number;
  month: number;
  periodName: string;
  status?: 'DRAFT' | 'CALCULATED' | 'PAID';
  settings: PayrollFormulaSettings;
  existingId?: string;
  notes?: string;
}): PayrollRecord {
  const { teacher, hoursWorked, kpiBonus, advancePaid, year, month, periodName, status = 'CALCULATED', settings, existingId, notes } = params;

  // 1. Оплата по тарификации за фактически отработанные часы
  // Базовый тарифный оклад при 72 часах в месяц (норма СПО в РБ)
  // Тарифный коэффициент в зависимости от разряда (в РБ 8-11 разряды)
  const rankMultiplier = 1 + Math.max(0, teacher.tariffRank - 7) * 0.12;
  const standardMonthlyTariff = settings.baseRate * rankMultiplier;
  const hourlyRate = standardMonthlyTariff / settings.standardMonthlyHours;
  const tariffSalary = roundByn(hoursWorked * hourlyRate);

  // 2. Надбавка за специфику работы в сфере образования (по Постановлению Минобразования РБ)
  const specificEducationBonus = roundByn(tariffSalary * (settings.educationSectorBonusPercent / 100));

  // 3. Надбавка за квалификационную категорию (% от базовой ставки в РБ)
  const categoryPercent = settings.categoryBonusPercent[teacher.qualificationCategory] || 0;
  const categoryBonus = roundByn(settings.baseRate * (categoryPercent / 100));

  // 4. Надбавка за стаж работы в бюджетных организациях (от базовой ставки)
  const rule = settings.experienceRules.find(
    (r) => teacher.experienceYears >= r.minYears && teacher.experienceYears < r.maxYears
  ) || settings.experienceRules[settings.experienceRules.length - 1];
  const experiencePercent = rule ? rule.percentOfBaseRate : 0;
  const experienceBonus = roundByn(settings.baseRate * (experiencePercent / 100));

  // 5. Кураторство учебной группы (классное руководство)
  const curatorBonus = teacher.isGroupCurator
    ? roundByn(settings.baseRate * (settings.curatorBonusPercentOfBaseRate / 100))
    : 0;

  // 6. Заведование учебным кабинетом / лабораторией
  const cabinetBonus = teacher.hasCabinetManagement
    ? roundByn(settings.baseRate * (settings.cabinetManagementPercentOfBaseRate / 100))
    : 0;

  // 7. Проверка письменных работ / тетрадей (процент от оплаты часов)
  const writtenWorkBonus = teacher.hasWrittenWorkCheck
    ? roundByn(tariffSalary * (settings.writtenWorkCheckPercent / 100))
    : 0;

  // 8. Руководство цикловой комиссией (ЦК)
  const headOfCommissionBonus = teacher.isHeadOfCycleCommission
    ? roundByn(settings.baseRate * (settings.headOfCommissionBonusPercent / 100))
    : 0;

  // ВСЕГО НАЧИСЛЕНО (Gross)
  const grossTotal = roundByn(
    tariffSalary +
    specificEducationBonus +
    categoryBonus +
    experienceBonus +
    curatorBonus +
    cabinetBonus +
    writtenWorkBonus +
    headOfCommissionBonus +
    kpiBonus
  );

  // УДЕРЖАНИЯ
  // Стандартный налоговый вычет на детей до 18 лет
  const childDeduction = teacher.hasChildrenTaxDeduction
    ? teacher.childrenCount * settings.childTaxDeductionPerChild
    : 0;

  // Подоходный налог (13% в РБ)
  const taxableBase = Math.max(0, grossTotal - childDeduction);
  const incomeTax = roundByn(taxableBase * (settings.incomeTaxRate / 100));

  // Взнос в Фонд социальной защиты населения (ФСЗН) - 1% пенсионный с работника
  const pensionFund = roundByn(grossTotal * (settings.pensionFundRate / 100));

  // Профсоюзный взнос (1%)
  const tradeUnion = teacher.isTradeUnionMember
    ? roundByn(grossTotal * (settings.tradeUnionRate / 100))
    : 0;

  // Всего удержано
  const deductionsTotal = roundByn(incomeTax + pensionFund + tradeUnion + advancePaid);

  // К ВЫПЛАТЕ НА РУКИ (Net)
  const netPayable = roundByn(Math.max(0, grossTotal - deductionsTotal));

  const now = new Date().toISOString();

  return {
    id: existingId || `pay-${teacher.id}-${year}-${month}`,
    teacherId: teacher.id,
    year,
    month,
    periodName,
    status,
    academicHoursWorked: hoursWorked,
    tariffSalary,
    specificEducationBonus,
    categoryBonus,
    experienceBonus,
    curatorBonus,
    cabinetBonus,
    writtenWorkBonus,
    headOfCommissionBonus,
    kpiBonus,
    grossTotal,
    incomeTax,
    pensionFund,
    tradeUnion,
    advancePaid,
    deductionsTotal,
    netPayable,
    createdAt: now,
    updatedAt: now,
    notes,
  };
}
