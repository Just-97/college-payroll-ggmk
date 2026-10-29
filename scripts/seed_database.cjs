const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://otyfkcjudwukzcavhqmv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uT2TL4sG_6_jFJR9Qa4cPA_cAeyisDW';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const SETTINGS = {
  collegeName: 'УО «Гомельский государственный машиностроительный колледж»',
  chiefAccountantName: 'Ковалёва Е.С.',
  baseRate: 270.00,
  standardMonthlyHours: 72,
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
  educationSectorBonusPercent: 40,
  curatorBonusPercentOfBaseRate: 80,
  cabinetManagementPercentOfBaseRate: 20,
  writtenWorkCheckPercent: 12,
  headOfCommissionBonusPercent: 25,
  incomeTaxRate: 13,
  pensionFundRate: 1,
  tradeUnionRate: 1,
  childTaxDeductionPerChild: 51.00,
};

const TEACHERS = [
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
    cabinetName: null,
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
    curatorGroupName: null,
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
    curatorGroupName: null,
    hasCabinetManagement: false,
    cabinetName: null,
    hasWrittenWorkCheck: false,
    isHeadOfCycleCommission: false,
    tariffRank: 9,
    isTradeUnionMember: true,
    hasChildrenTaxDeduction: false,
    childrenCount: 0,
  },
];

const USERS = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@ggmk.by',
    password: 'admin2026',
    fullName: 'Сидоров Михаил Петрович (Системный администратор)',
    role: 'ADMIN',
    teacherId: null,
    isActive: true,
  },
  {
    id: 'u-buh',
    username: 'buhgalter',
    email: 'buh@ggmk.by',
    password: 'buh2026',
    fullName: 'Ковалёва Елена Станиславовна (Главный бухгалтер)',
    role: 'ACCOUNTANT',
    teacherId: null,
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
    isActive: true,
  },
];

function roundByn(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateTeacherPayroll(params) {
  const { teacher, hoursWorked, kpiBonus, advancePaid, year, month, periodName, status = 'CALCULATED', notes } = params;

  const rankMultiplier = 1 + Math.max(0, teacher.tariffRank - 7) * 0.12;
  const standardMonthlyTariff = SETTINGS.baseRate * rankMultiplier;
  const hourlyRate = standardMonthlyTariff / SETTINGS.standardMonthlyHours;
  const tariffSalary = roundByn(hoursWorked * hourlyRate);

  const specificEducationBonus = roundByn(tariffSalary * (SETTINGS.educationSectorBonusPercent / 100));
  const categoryPercent = SETTINGS.categoryBonusPercent[teacher.qualificationCategory] || 0;
  const categoryBonus = roundByn(SETTINGS.baseRate * (categoryPercent / 100));

  const rule = SETTINGS.experienceRules.find(
    (r) => teacher.experienceYears >= r.minYears && teacher.experienceYears < r.maxYears
  ) || SETTINGS.experienceRules[SETTINGS.experienceRules.length - 1];
  const experiencePercent = rule ? rule.percentOfBaseRate : 0;
  const experienceBonus = roundByn(SETTINGS.baseRate * (experiencePercent / 100));

  const curatorBonus = teacher.isGroupCurator
    ? roundByn(SETTINGS.baseRate * (SETTINGS.curatorBonusPercentOfBaseRate / 100))
    : 0;

  const cabinetBonus = teacher.hasCabinetManagement
    ? roundByn(SETTINGS.baseRate * (SETTINGS.cabinetManagementPercentOfBaseRate / 100))
    : 0;

  const writtenWorkBonus = teacher.hasWrittenWorkCheck
    ? roundByn(tariffSalary * (SETTINGS.writtenWorkCheckPercent / 100))
    : 0;

  const headOfCommissionBonus = teacher.isHeadOfCycleCommission
    ? roundByn(SETTINGS.baseRate * (SETTINGS.headOfCommissionBonusPercent / 100))
    : 0;

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

  const childDeduction = teacher.hasChildrenTaxDeduction
    ? teacher.childrenCount * SETTINGS.childTaxDeductionPerChild
    : 0;

  const taxableBase = Math.max(0, grossTotal - childDeduction);
  const incomeTax = roundByn(taxableBase * (SETTINGS.incomeTaxRate / 100));
  const pensionFund = roundByn(grossTotal * (SETTINGS.pensionFundRate / 100));
  const tradeUnion = teacher.isTradeUnionMember
    ? roundByn(grossTotal * (SETTINGS.tradeUnionRate / 100))
    : 0;

  const deductionsTotal = roundByn(incomeTax + pensionFund + tradeUnion + advancePaid);
  const netPayable = roundByn(Math.max(0, grossTotal - deductionsTotal));

  return {
    id: `pay-${teacher.id}-${year}-${month}`,
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
    notes: notes || '',
  };
}

async function runSeed() {
  console.log('--- 1. UPSERTING SETTINGS ---');
  await client.from('payroll_settings').upsert({
    id: 'current',
    college_name: SETTINGS.collegeName,
    chief_accountant_name: SETTINGS.chiefAccountantName,
    base_rate: SETTINGS.baseRate,
    standard_monthly_hours: SETTINGS.standardMonthlyHours,
    education_sector_bonus_percent: SETTINGS.educationSectorBonusPercent,
    curator_bonus_percent: SETTINGS.curatorBonusPercentOfBaseRate,
    cabinet_management_percent: SETTINGS.cabinetManagementPercentOfBaseRate,
    written_work_percent: SETTINGS.writtenWorkCheckPercent,
    head_of_commission_percent: SETTINGS.headOfCommissionBonusPercent,
    income_tax_rate: SETTINGS.incomeTaxRate,
    pension_fund_rate: SETTINGS.pensionFundRate,
    trade_union_rate: SETTINGS.tradeUnionRate,
    child_tax_deduction: SETTINGS.childTaxDeductionPerChild,
    updated_at: new Date().toISOString(),
  });

  console.log('--- 2. UPSERTING TEACHERS ---');
  for (const t of TEACHERS) {
    const { error } = await client.from('teachers').upsert({
      id: t.id,
      full_name: t.fullName,
      tab_number: t.tabNumber,
      department: t.department,
      position: t.position,
      qualification_category: t.qualificationCategory,
      experience_years: t.experienceYears,
      education_level: t.educationLevel,
      is_group_curator: t.isGroupCurator,
      curator_group_name: t.curatorGroupName,
      has_cabinet_management: t.hasCabinetManagement,
      cabinet_name: t.cabinetName,
      has_written_work_check: t.hasWrittenWorkCheck,
      is_head_of_cycle_commission: t.isHeadOfCycleCommission,
      tariff_rank: t.tariffRank,
      is_trade_union_member: t.isTradeUnionMember,
      has_children_tax_deduction: t.hasChildrenTaxDeduction,
      children_count: t.childrenCount,
    });
    if (error) console.error(`Teacher ${t.fullName} error:`, error);
  }

  console.log('--- 3. CLEANING DUMMY TEST USERS & UPSERTING USERS ---');
  // Remove dummy user u-1791610629840
  await client.from('users').delete().eq('id', 'u-1791610629840');

  for (const u of USERS) {
    const { error } = await client.from('users').upsert({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,
      full_name: u.fullName,
      role: u.role,
      teacher_id: u.teacherId,
      is_active: u.isActive,
    });
    if (error) console.error(`User ${u.username} error:`, error);
  }

  console.log('--- 4. GENERATING AND UPSERTING PAYROLL RECORDS ---');
  const periods = [
    { year: 2026, month: 10, periodName: 'Октябрь 2026', status: 'CALCULATED', kpiFactor: 1.1, advance: 450 },
    { year: 2026, month: 9, periodName: 'Сентябрь 2026', status: 'PAID', kpiFactor: 1.0, advance: 400 },
    { year: 2026, month: 8, periodName: 'Август 2026', status: 'PAID', kpiFactor: 0.8, advance: 350 },
  ];

  const hoursMap = {
    't-1': { 10: 76, 9: 72, 8: 72 },
    't-2': { 10: 72, 9: 72, 8: 70 },
    't-3': { 10: 70, 9: 68, 8: 68 },
    't-4': { 10: 80, 9: 76, 8: 72 },
    't-5': { 10: 74, 9: 72, 8: 72 },
  };

  const baseKpiMap = {
    't-1': 160,
    't-2': 110,
    't-3': 75,
    't-4': 200,
    't-5': 90,
  };

  const notesMap = {
    't-1': 'Основная нагрузка + руководство курсовыми работами ЦК',
    't-2': 'Учебный план, кураторство группы и проверка контрольных',
    't-3': 'Молодой специалист, заведование монтажной мастерской',
    't-4': 'Методическая работа, разработка учебно-методического комплекса (УМК)',
    't-5': 'Проведение лабораторно-практических занятий по БД',
  };

  const allRecords = [];
  for (const t of TEACHERS) {
    for (const p of periods) {
      const hours = hoursMap[t.id][p.month];
      const kpi = roundByn(baseKpiMap[t.id] * p.kpiFactor);
      const adv = p.advance;
      const rec = calculateTeacherPayroll({
        teacher: t,
        hoursWorked: hours,
        kpiBonus: kpi,
        advancePaid: adv,
        year: p.year,
        month: p.month,
        periodName: p.periodName,
        status: p.status,
        notes: notesMap[t.id],
      });
      allRecords.push(rec);

      const { error } = await client.from('payroll_records').upsert({
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
        notes: rec.notes,
        created_at: rec.createdAt,
        updated_at: rec.updatedAt,
      });

      if (error) {
        console.error(`Error saving payroll ${rec.id}:`, error);
      } else {
        console.log(`Saved payroll ${rec.id}: ${t.fullName} (${p.periodName}) -> Gross: ${rec.grossTotal} BYN, Net: ${rec.netPayable} BYN`);
      }
    }
  }

  console.log(`--- SEED COMPLETE: ${allRecords.length} records generated and synced! ---`);
}

runSeed().catch(console.error);
