import { Teacher, User, PayrollFormulaSettings, PayrollRecord, AuditLog } from '../types';
import { calculateTeacherPayroll } from './calculator';
import { DEFAULT_SETTINGS } from './constants';
import { DatabaseService } from './supabase';

export { DEFAULT_SETTINGS };

const STORAGE_KEYS = {
  USERS: 'college_payroll_users_v3',
  TEACHERS: 'college_payroll_teachers_v3',
  SETTINGS: 'college_payroll_settings_v3',
  PAYROLLS: 'college_payroll_records_v3',
  AUDIT: 'college_payroll_audit_v3',
  CURRENT_USER: 'college_payroll_current_user_v3',
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
    educationLevel: 'Высшее (БГУИР, переподготовка РИПО)',
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
    cabinetName: undefined,
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
    curatorGroupName: undefined,
    hasCabinetManagement: true,
    cabinetName: 'Каб. 108 «Мастерская монтажа радиоэлектроники»',
    hasWrittenWorkCheck: false,
    isHeadOfCycleCommission: false,
    tariffRank: 8,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: false,
    childrenCount: 0,
  },
  {
    id: 't-4',
    fullName: 'Смирнова Светлана Владимировна',
    tabNumber: 'ТН-0188',
    department: 'Отделение машиностроения и металлообработки',
    position: 'Преподаватель инженерной графики и механики',
    qualificationCategory: 'METHODIST',
    experienceYears: 21,
    educationLevel: 'Высшее (ГГТУ им. П.О. Сухого)',
    isGroupCurator: true,
    curatorGroupName: 'гр. 23-ТМ-1',
    hasCabinetManagement: true,
    cabinetName: 'Каб. 205 «Инженерная графика и САПР»',
    hasWrittenWorkCheck: true,
    isHeadOfCycleCommission: false,
    tariffRank: 11,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: true,
    childrenCount: 1,
  },
  {
    id: 't-5',
    fullName: 'Григорьев Павел Андреевич',
    tabNumber: 'ТН-0235',
    department: 'Отделение информационных технологий',
    position: 'Преподаватель веб-разработки и баз данных',
    qualificationCategory: 'SECOND',
    experienceYears: 5,
    educationLevel: 'Высшее (ГГУ им. Ф. Скорины)',
    isGroupCurator: false,
    curatorGroupName: undefined,
    hasCabinetManagement: false,
    cabinetName: undefined,
    hasWrittenWorkCheck: false,
    isHeadOfCycleCommission: false,
    tariffRank: 9,
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
  {
    id: 'u-t4',
    username: 'smirnova.sv',
    email: 'smirnova.sv@ggmk.by',
    password: 'smirnova26',
    fullName: 'Смирнова Светлана Владимировна',
    role: 'TEACHER',
    teacherId: 't-4',
    createdAt: '2026-09-01T09:45:00Z',
    isActive: true,
  },
  {
    id: 'u-t5',
    username: 'grigoriev.pa',
    email: 'grigoriev.pa@ggmk.by',
    password: 'grigoriev26',
    fullName: 'Григорьев Павел Андреевич',
    role: 'TEACHER',
    teacherId: 't-5',
    createdAt: '2026-09-01T10:00:00Z',
    isActive: true,
  },
];

function generateSeedPayrolls(): PayrollRecord[] {
  const records: PayrollRecord[] = [];
  const settings = DEFAULT_SETTINGS;

  const periods = [
    { year: 2026, month: 10, periodName: 'Октябрь 2026', status: 'CALCULATED' as const, kpiFactor: 1.1, advance: 450 },
    { year: 2026, month: 9, periodName: 'Сентябрь 2026', status: 'PAID' as const, kpiFactor: 1.0, advance: 400 },
    { year: 2026, month: 8, periodName: 'Август 2026', status: 'PAID' as const, kpiFactor: 0.8, advance: 350 },
  ];

  const hoursMap: Record<string, Record<number, number>> = {
    't-1': { 10: 76, 9: 72, 8: 72 },
    't-2': { 10: 72, 9: 72, 8: 70 },
    't-3': { 10: 70, 9: 68, 8: 68 },
    't-4': { 10: 80, 9: 76, 8: 72 },
    't-5': { 10: 74, 9: 72, 8: 72 },
  };

  const baseKpiMap: Record<string, number> = {
    't-1': 160,
    't-2': 110,
    't-3': 75,
    't-4': 200,
    't-5': 90,
  };

  const notesMap: Record<string, string> = {
    't-1': 'Основная нагрузка + руководство курсовыми работами ЦК',
    't-2': 'Учебный план, кураторство группы и проверка контрольных',
    't-3': 'Молодой специалист, заведование монтажной мастерской',
    't-4': 'Методическая работа, разработка учебно-методического комплекса (УМК)',
    't-5': 'Проведение лабораторно-практических занятий по БД',
  };

  for (const t of INITIAL_TEACHERS) {
    for (const p of periods) {
      const hours = hoursMap[t.id]?.[p.month] || 72;
      const kpi = Math.round((baseKpiMap[t.id] || 100) * p.kpiFactor);
      records.push(calculateTeacherPayroll({
        teacher: t,
        hoursWorked: hours,
        kpiBonus: kpi,
        advancePaid: p.advance,
        year: p.year,
        month: p.month,
        periodName: p.periodName,
        status: p.status,
        settings,
        existingId: `pay-${t.id}-${p.year}-${p.month}`,
        notes: notesMap[t.id] || '',
      }));
    }
  }

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
    DatabaseService.saveSettings(settings).catch(() => {});
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
    DatabaseService.saveTeacher(teacher).catch(() => {});
  },

  deleteTeacher(id: string): void {
    const teachers = this.getTeachers().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    DatabaseService.deleteTeacher(id).catch(() => {});
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
    DatabaseService.savePayroll(record).catch(() => {});
  },

  saveAllPayrolls(records: PayrollRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(records));
  },

  deletePayroll(id: string): void {
    const payrolls = this.getPayrolls().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(payrolls));
    this.addAuditLog('ACCOUNTANT', 'Удаление расчета', `Удален расчет ${id}`);
    DatabaseService.deletePayroll(id).catch(() => {});
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
    DatabaseService.saveUser(user).catch(() => {});
  },

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addAuditLog('ADMIN', 'Удаление пользователя', `Удален ID: ${id}`);
    DatabaseService.deleteUser(id).catch(() => {});
  },

  async hydrateFromSupabase(): Promise<boolean> {
    try {
      const [dbSettings, dbTeachers, dbUsers, dbPayrolls] = await Promise.all([
        DatabaseService.getSettings(),
        DatabaseService.getTeachers(),
        DatabaseService.getUsers(),
        DatabaseService.getPayrolls(),
      ]);

      let updated = false;
      if (dbSettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(dbSettings));
        updated = true;
      }
      if (dbTeachers && dbTeachers.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(dbTeachers));
        updated = true;
      }
      if (dbUsers && dbUsers.length > 0) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dbUsers));
        updated = true;
      }
      if (dbPayrolls && dbPayrolls.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(dbPayrolls));
        updated = true;
      }
      return updated;
    } catch {
      return false;
    }
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
