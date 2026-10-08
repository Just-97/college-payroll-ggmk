import { Teacher, User, PayrollFormulaSettings, PayrollRecord, AuditLog } from '../types';
import { calculateTeacherPayroll } from './calculator';

const STORAGE_KEYS = {
  USERS: 'college_payroll_users_v2',
  TEACHERS: 'college_payroll_teachers_v2',
  SETTINGS: 'college_payroll_settings_v2',
  PAYROLLS: 'college_payroll_records_v2',
  AUDIT: 'college_payroll_audit_v2',
  CURRENT_USER: 'college_payroll_current_user_v2',
};

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

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    fullName: 'Ковалёв Дмитрий Сергеевич',
    tabNumber: 'ТН-0102',
    department: 'Отделение информационных технологий',
    position: 'Преподаватель спецдисциплин',
    qualificationCategory: 'HIGHER',
    experienceYears: 16,
    educationLevel: 'Высшее (БГУИР, педагогическая переподготовка РИПО)',
    isGroupCurator: true,
    curatorGroupName: 'гр. 24-ПО-1',
    hasCabinetManagement: true,
    cabinetName: 'Каб. 314 «Лаборатория системного программирования»',
    hasWrittenWorkCheck: false,
    isHeadOfCycleCommission: true,
    tariffRank: 11,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: true,
    childrenCount: 1,
  },
  {
    id: 't-2',
    fullName: 'Мороз Ольга Николаевна',
    tabNumber: 'ТН-0145',
    department: 'Отделение общеобразовательных дисциплин',
    position: 'Преподаватель математики и информатики',
    qualificationCategory: 'FIRST',
    experienceYears: 8,
    educationLevel: 'Высшее (БГПУ им. М. Танка)',
    isGroupCurator: true,
    curatorGroupName: 'гр. 25-МТ-2',
    hasCabinetManagement: false,
    hasWrittenWorkCheck: true,
    isHeadOfCycleCommission: false,
    tariffRank: 9,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: true,
    childrenCount: 2,
  },
  {
    id: 't-3',
    fullName: 'Василевич Артём Игоревич',
    tabNumber: 'ТН-0210',
    department: 'Отделение электроники и микропроцессорной техники',
    position: 'Преподаватель электротехники',
    qualificationCategory: 'NONE',
    experienceYears: 2,
    educationLevel: 'Высшее (БНТУ, молодой специалист)',
    isGroupCurator: false,
    hasCabinetManagement: true,
    cabinetName: 'Каб. 108 «Мастерская монтажа радиоэлектроники»',
    hasWrittenWorkCheck: false,
    isHeadOfCycleCommission: false,
    tariffRank: 8,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: false,
    childrenCount: 0,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@ggmk.by',
    password: 'admin2026',
    fullName: 'Сидоров Михаил Петрович (Системный администратор)',
    role: 'ADMIN',
    createdAt: '2026-09-01T08:00:00Z',
    isActive: true,
  },
  {
    id: 'u-buh',
    username: 'buhgalter',
    email: 'buh@ggmk.by',
    password: 'buh2026',
    fullName: 'Ковалёва Елена Станиславовна (Главный бухгалтер)',
    role: 'ACCOUNTANT',
    createdAt: '2026-09-01T08:30:00Z',
    isActive: true,
  },
  {
    id: 'u-t1',
    username: 'kovalev.ds',
    email: 'kovalev.ds@ggmk.by',
    password: 'kovalev26',
    fullName: 'Ковалёв Дмитрий Сергеевич',
    role: 'TEACHER',
    teacherId: 't-1',
    createdAt: '2026-09-01T09:00:00Z',
    isActive: true,
  },
  {
    id: 'u-t2',
    username: 'moroz.on',
    email: 'moroz.on@ggmk.by',
    password: 'moroz26',
    fullName: 'Мороз Ольга Николаевна',
    role: 'TEACHER',
    teacherId: 't-2',
    createdAt: '2026-09-01T09:15:00Z',
    isActive: true,
  },
  {
    id: 'u-t3',
    username: 'vasilevich.ai',
    email: 'vasilevich.ai@ggmk.by',
    password: 'vasilevich26',
    fullName: 'Василевич Артём Игоревич',
    role: 'TEACHER',
    teacherId: 't-3',
    createdAt: '2026-09-01T09:30:00Z',
    isActive: true,
  },
];

function generateSeedPayrolls(): PayrollRecord[] {
  const records: PayrollRecord[] = [];
  const settings = DEFAULT_SETTINGS;

  // Сентябрь 2026 (Текущий рассчитанный месяц)
  records.push(calculateTeacherPayroll({
    teacher: INITIAL_TEACHERS[0],
    hoursWorked: 76,
    kpiBonus: 180.00,
    advancePaid: 450.00,
    year: 2026,
    month: 9,
    periodName: 'Сентябрь 2026',
    status: 'CALCULATED',
    settings,
    notes: 'Основная нагрузка + руководство курсовым проектированием',
  }));

  records.push(calculateTeacherPayroll({
    teacher: INITIAL_TEACHERS[1],
    hoursWorked: 72,
    kpiBonus: 120.00,
    advancePaid: 380.00,
    year: 2026,
    month: 9,
    periodName: 'Сентябрь 2026',
    status: 'CALCULATED',
    settings,
    notes: 'Нагрузка по плану, кураторство',
  }));

  records.push(calculateTeacherPayroll({
    teacher: INITIAL_TEACHERS[2],
    hoursWorked: 68,
    kpiBonus: 80.00,
    advancePaid: 300.00,
    year: 2026,
    month: 9,
    periodName: 'Сентябрь 2026',
    status: 'CALCULATED',
    settings,
    notes: 'Молодой специалист, заведование мастерской',
  }));

  // Август 2026 (Выплаченный месяц / отпускные/подготовка)
  records.push(calculateTeacherPayroll({
    teacher: INITIAL_TEACHERS[0],
    hoursWorked: 72,
    kpiBonus: 150.00,
    advancePaid: 400.00,
    year: 2026,
    month: 8,
    periodName: 'Август 2026',
    status: 'PAID',
    settings,
  }));

  records.push(calculateTeacherPayroll({
    teacher: INITIAL_TEACHERS[1],
    hoursWorked: 72,
    kpiBonus: 100.00,
    advancePaid: 350.00,
    year: 2026,
    month: 8,
    periodName: 'Август 2026',
    status: 'PAID',
    settings,
  }));

  return records;
}

export const StorageService = {
  getSettings(): PayrollFormulaSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: PayrollFormulaSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.addAuditLog('SYSTEM', 'Обновление формул и базовой ставки', `Базовая ставка: ${settings.baseRate} BYN`);
  },

  getTeachers(): Teacher[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TEACHERS;
    }
  },

  saveTeacher(teacher: Teacher): void {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      teachers[index] = teacher;
    } else {
      teachers.push(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    this.addAuditLog('ACCOUNTANT', 'Сохранение преподавателя', `Преподаватель: ${teacher.fullName}`);
  },

  deleteTeacher(id: string): void {
    const teachers = this.getTeachers().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  getPayrolls(): PayrollRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYROLLS);
    if (!raw) {
      const seeded = generateSeedPayrolls();
      localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  savePayroll(record: PayrollRecord): void {
    const payrolls = this.getPayrolls();
    const index = payrolls.findIndex(p => p.id === record.id);
    if (index >= 0) {
      payrolls[index] = record;
    } else {
      payrolls.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(payrolls));
    this.addAuditLog('ACCOUNTANT', 'Расчет зарплаты', `Листок ID ${record.id}: начислено ${record.grossTotal} BYN`);
  },

  deletePayroll(id: string): void {
    const payrolls = this.getPayrolls().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(payrolls));
    this.addAuditLog('ACCOUNTANT', 'Удаление расчета', `Удален расчет ${id}`);
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addAuditLog('ADMIN', 'Управление пользователем', `Пользователь: ${user.username} (${user.role})`);
  },

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addAuditLog('ADMIN', 'Удаление пользователя', `Удален ID: ${id}`);
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // По умолчанию авторизован преподаватель Ковалёв Д.С.
    return INITIAL_USERS[2];
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addAuditLog(userName: string, action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleString('ru-RU'),
      userId: 'usr',
      userName,
      action,
      details,
    };
    logs.unshift(newLog);
    // хранить последние 100 записей
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 100)));
  },

  resetToDefault(): void {
    localStorage.clear();
  }
};
