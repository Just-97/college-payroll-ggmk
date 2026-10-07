export type UserRole = 'TEACHER' | 'ACCOUNTANT' | 'ADMIN';

export type QualificationCategory = 'NONE' | 'SECOND' | 'FIRST' | 'HIGHER' | 'METHODIST';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Видим администратору согласно требованию
  fullName: string;
  role: UserRole;
  teacherId?: string; // Привязка к карточке преподавателя
  createdAt: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  fullName: string;
  tabNumber: string;
  department: string;
  position: string;
  qualificationCategory: QualificationCategory;
  experienceYears: number;
  educationLevel: string;
  isGroupCurator: boolean;
  curatorGroupName?: string;
  hasCabinetManagement: boolean;
  cabinetName?: string;
  hasWrittenWorkCheck: boolean;
  isHeadOfCycleCommission: boolean;
  tariffRank: number; // Тарифный разряд
  isTradeUnionMember: boolean;
  hasChildrenTaxDeduction: boolean;
  childrenCount: number;
}

export interface ExperienceBonusRule {
  minYears: number;
  maxYears: number;
  percentOfBaseRate: number; // Процент от базовой ставки в РБ
}

export interface PayrollFormulaSettings {
  collegeName: string;
  chiefAccountantName: string;
  baseRate: number; // Базовая ставка в BYN (например 270.00)
  standardMonthlyHours: number; // 72 часа в месяц (при норме 720 ч/год)
  categoryBonusPercent: Record<QualificationCategory, number>; // % от базовой ставки
  experienceRules: ExperienceBonusRule[];
  educationSectorBonusPercent: number; // % надбавки за специфику в сфере образования от оклада
  curatorBonusPercentOfBaseRate: number; // % от базовой ставки за кураторство (напр. 80%)
  cabinetManagementPercentOfBaseRate: number; // % за кабинет (напр. 20%)
  writtenWorkCheckPercent: number; // % от часовой ставки за проверку тетрадей (напр. 15%)
  headOfCommissionBonusPercent: number; // % за руководство ЦК (напр. 25%)
  incomeTaxRate: number; // 13%
  pensionFundRate: number; // 1% в ФСЗН
  tradeUnionRate: number; // 1% в профсоюз
  childTaxDeductionPerChild: number; // Налоговый вычет на ребенка в BYN
}

export interface PayrollRecord {
  id: string;
  teacherId: string;
  year: number;
  month: number;
  periodName: string;
  status: 'DRAFT' | 'CALCULATED' | 'PAID';
  academicHoursWorked: number; // Часы педагогической нагрузки
  
  // Составляющие начислений
  tariffSalary: number; // Оплата за часы
  specificEducationBonus: number; // Надбавка за специфику образования
  categoryBonus: number; // Надбавка за категорию
  experienceBonus: number; // Надбавка за стаж
  curatorBonus: number; // Надбавка за кураторство
  cabinetBonus: number; // Заведование кабинетом
  writtenWorkBonus: number; // Проверка тетрадей
  headOfCommissionBonus: number; // Руководство цикловой комиссией
  kpiBonus: number; // Премия / стимулирующая выплата
  grossTotal: number; // Всего начислено

  // Удержания
  incomeTax: number; // Подоходный налог 13%
  pensionFund: number; // ФСЗН 1%
  tradeUnion: number; // Профсоюз 1%
  advancePaid: number; // Выплаченный аванс
  deductionsTotal: number; // Всего удержано

  // Итог
  netPayable: number; // К выплате на руки
  
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}
