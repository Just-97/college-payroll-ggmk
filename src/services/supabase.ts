import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Teacher, PayrollRecord, PayrollFormulaSettings, AuditLog } from '../types';
import { DEFAULT_SETTINGS } from './constants';

const DEFAULT_SUPABASE_URL = 'https://otyfkcjudwukzcavhqmv.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_uT2TL4sG_6_jFJR9Qa4cPA_cAeyisDW';

// Получаем переменные окружения, localStorage или встроенные параметры проекта
const envUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('supabase_custom_url') ||
  DEFAULT_SUPABASE_URL;

const envKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('supabase_custom_key') ||
  DEFAULT_SUPABASE_KEY;

export let supabase: SupabaseClient | null = null;

if (envUrl && envKey) {
  try {
    supabase = createClient(envUrl, envKey);
  } catch (err) {
    console.warn('Ошибка инициализации клиента Supabase:', err);
    supabase = null;
  }
}


export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export function configureSupabaseClient(url: string, key: string): boolean {
  if (!url || !key) {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_key');
    supabase = null;
    return false;
  }
  try {
    supabase = createClient(url, key);
    localStorage.setItem('supabase_custom_url', url);
    localStorage.setItem('supabase_custom_key', key);
    return true;
  } catch (err) {
    console.error('Ошибка конфигурации Supabase:', err);
    return false;
  }
}

// Асинхронные методы работы с Supabase (с автоматическим фоллбэком)
export const DatabaseService = {
  async getSettings(): Promise<PayrollFormulaSettings | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('payroll_settings').select('*').eq('id', 'current').single();
      if (error || !data) return null;
      return {
        ...DEFAULT_SETTINGS,
        collegeName: data.college_name,
        chiefAccountantName: data.chief_accountant_name,
        baseRate: Number(data.base_rate),
        standardMonthlyHours: Number(data.standard_monthly_hours),
        educationSectorBonusPercent: Number(data.education_sector_bonus_percent),
        curatorBonusPercentOfBaseRate: Number(data.curator_bonus_percent),
        cabinetManagementPercentOfBaseRate: Number(data.cabinet_management_percent),
        writtenWorkCheckPercent: Number(data.written_work_percent),
        headOfCommissionBonusPercent: Number(data.head_of_commission_percent),
        incomeTaxRate: Number(data.income_tax_rate),
        pensionFundRate: Number(data.pension_fund_rate),
        tradeUnionRate: Number(data.trade_union_rate),
        childTaxDeductionPerChild: Number(data.child_tax_deduction),
      };
    } catch {
      return null;
    }
  },

  async saveSettings(settings: PayrollFormulaSettings): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('payroll_settings').upsert({
        id: 'current',
        college_name: settings.collegeName,
        chief_accountant_name: settings.chiefAccountantName,
        base_rate: settings.baseRate,
        standard_monthly_hours: settings.standardMonthlyHours,
        education_sector_bonus_percent: settings.educationSectorBonusPercent,
        curator_bonus_percent: settings.curatorBonusPercentOfBaseRate,
        cabinet_management_percent: settings.cabinetManagementPercentOfBaseRate,
        written_work_percent: settings.writtenWorkCheckPercent,
        head_of_commission_percent: settings.headOfCommissionBonusPercent,
        income_tax_rate: settings.incomeTaxRate,
        pension_fund_rate: settings.pensionFundRate,
        trade_union_rate: settings.tradeUnionRate,
        child_tax_deduction: settings.childTaxDeductionPerChild,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },

  async getTeachers(): Promise<Teacher[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('teachers').select('*');
      if (error || !data) return null;
      return data.map((t: any) => ({
        id: t.id,
        fullName: t.full_name,
        tabNumber: t.tab_number,
        department: t.department,
        position: t.position,
        qualificationCategory: t.qualification_category,
        experienceYears: t.experience_years,
        educationLevel: t.education_level,
        isGroupCurator: t.is_group_curator,
        curatorGroupName: t.curator_group_name,
        hasCabinetManagement: t.has_cabinet_management,
        cabinetName: t.cabinet_name,
        hasWrittenWorkCheck: t.has_written_work_check,
        isHeadOfCycleCommission: t.is_head_of_cycle_commission,
        tariffRank: t.tariff_rank,
        isTradeUnionMember: t.is_trade_union_member,
        hasChildrenTaxDeduction: t.has_children_tax_deduction,
        childrenCount: t.children_count,
      }));
    } catch {
      return null;
    }
  },

  async saveTeacher(teacher: Teacher): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('teachers').upsert({
        id: teacher.id,
        full_name: teacher.fullName,
        tab_number: teacher.tabNumber,
        department: teacher.department,
        position: teacher.position,
        qualification_category: teacher.qualificationCategory,
        experience_years: teacher.experienceYears,
        education_level: teacher.educationLevel,
        is_group_curator: teacher.isGroupCurator,
        curator_group_name: teacher.curatorGroupName,
        has_cabinet_management: teacher.hasCabinetManagement,
        cabinet_name: teacher.cabinetName,
        has_written_work_check: teacher.hasWrittenWorkCheck,
        is_head_of_cycle_commission: teacher.isHeadOfCycleCommission,
        tariff_rank: teacher.tariffRank,
        is_trade_union_member: teacher.isTradeUnionMember,
        has_children_tax_deduction: teacher.hasChildrenTaxDeduction,
        children_count: teacher.childrenCount,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async getUsers(): Promise<User[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error || !data) return null;
      return data.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        password: u.password,
        fullName: u.full_name,
        role: u.role,
        teacherId: u.teacher_id,
        createdAt: u.created_at,
        isActive: u.is_active,
      }));
    } catch {
      return null;
    }
  },

  async saveUser(user: User): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        role: user.role,
        teacher_id: user.teacherId || null,
        is_active: user.isActive,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async getPayrolls(): Promise<PayrollRecord[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('payroll_records').select('*');
      if (error || !data) return null;
      return data.map((p: any) => ({
        id: p.id,
        teacherId: p.teacher_id,
        year: p.year,
        month: p.month,
        periodName: p.period_name,
        status: p.status,
        academicHoursWorked: Number(p.academic_hours_worked),
        tariffSalary: Number(p.tariff_salary),
        specificEducationBonus: Number(p.specific_education_bonus),
        categoryBonus: Number(p.category_bonus),
        experienceBonus: Number(p.experience_bonus),
        curatorBonus: Number(p.curator_bonus),
        cabinetBonus: Number(p.cabinet_bonus),
        writtenWorkBonus: Number(p.written_work_bonus),
        headOfCommissionBonus: Number(p.head_of_commission_bonus),
        kpiBonus: Number(p.kpi_bonus),
        grossTotal: Number(p.gross_total),
        incomeTax: Number(p.income_tax),
        pensionFund: Number(p.pension_fund),
        tradeUnion: Number(p.trade_union),
        advancePaid: Number(p.advance_paid),
        deductionsTotal: Number(p.deductions_total),
        netPayable: Number(p.net_payable),
        notes: p.notes,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch {
      return null;
    }
  },

  async savePayroll(rec: PayrollRecord): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('payroll_records').upsert({
        id: rec.id,
        teacher_id: rec.teacherId,
        year: rec.year,
        month: rec.month,
        period_name: rec.periodName,
        status: rec.status,
        academic_hours_worked: rec.academicHoursWorked,
        tariff_salary: rec.tariffSalary,
        specific_education_bonus: rec.specificEducationBonus,
        category_bonus: rec.categoryBonus,
        experience_bonus: rec.experienceBonus,
        curator_bonus: rec.curatorBonus,
        cabinet_bonus: rec.cabinetBonus,
        written_work_bonus: rec.writtenWorkBonus,
        head_of_commission_bonus: rec.headOfCommissionBonus,
        kpi_bonus: rec.kpiBonus,
        gross_total: rec.grossTotal,
        income_tax: rec.incomeTax,
        pension_fund: rec.pensionFund,
        trade_union: rec.tradeUnion,
        advance_paid: rec.advancePaid,
        deductions_total: rec.deductionsTotal,
        net_payable: rec.netPayable,
        notes: rec.notes || null,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteTeacher(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deletePayroll(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('payroll_records').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async getAuditLogs(): Promise<AuditLog[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (error || !data) return null;
      return data.map((l: any) => ({
        id: l.id,
        timestamp: new Date(l.timestamp).toLocaleString('ru-RU'),
        userId: l.user_id || 'sys',
        userName: l.user_name,
        action: l.action,
        details: l.details,
      }));
    } catch {
      return null;
    }
  },

  async addAuditLog(userName: string, action: string, details: string): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('audit_logs').insert({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        user_name: userName,
        action,
        details,
      });
    } catch (err) {
      console.warn('Не удалось записать лог аудита в Supabase:', err);
    }
  },

  // Проверка связи с облаком Supabase
  async testConnection(): Promise<{ ok: boolean; message: string; tablesCount?: number }> {
    if (!supabase) {
      return { ok: false, message: 'Supabase клиент не инициализирован (проверьте URL и ключ)' };
    }
    try {
      const { data, error } = await supabase.from('teachers').select('id').limit(1);
      if (error) {
        return { ok: false, message: `Ошибка базы данных: ${error.message}` };
      }
      return {
        ok: true,
        message: 'Соединение с PostgreSQL успешно установлено! Таблицы доступны.',
        tablesCount: data ? data.length : 0,
      };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Не удалось выполнить запрос к Supabase' };
    }
  },

  // Первичная синхронизация локальных данных в Supabase
  async syncAllLocalToSupabase(payload: {
    settings: PayrollFormulaSettings;
    teachers: Teacher[];
    users: User[];
    payrolls: PayrollRecord[];
  }): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      return { success: false, message: 'Supabase не подключен' };
    }

    try {
      // 1. Settings
      await this.saveSettings(payload.settings);

      // 2. Teachers
      for (const t of payload.teachers) {
        await this.saveTeacher(t);
      }

      // 3. Users
      for (const u of payload.users) {
        await this.saveUser(u);
      }

      // 4. Payrolls
      for (const p of payload.payrolls) {
        await this.savePayroll(p);
      }

      return {
        success: true,
        message: `Успешно выгружено: ${payload.teachers.length} преподавателей, ${payload.users.length} пользователей, ${payload.payrolls.length} начислений!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Сбой при синхронизации: ${err?.message || 'Ошибка сети'}`,
      };
    }
  }
};

