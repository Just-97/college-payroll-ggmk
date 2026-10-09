-- ==============================================================================
-- СХЕМА БАЗЫ ДАННЫХ SUPABASE (POSTGRESQL)
-- Проект: Расчет заработной платы преподавателей колледжа (Республика Беларусь)
-- УО «Гомельский государственный машиностроительный колледж»
-- ==============================================================================

-- 1. ТАБЛИЦА НАСТРОЕК И НОРМАТИВОВ ОПЛАТЫ ТРУДА (РБ)
CREATE TABLE IF NOT EXISTS payroll_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    college_name TEXT NOT NULL DEFAULT 'УО «Гомельский государственный машиностроительный колледж»',
    chief_accountant_name TEXT NOT NULL DEFAULT 'Ковалёва Е.С.',
    base_rate NUMERIC(10, 2) NOT NULL DEFAULT 270.00, -- Базовая ставка в РБ (BYN)
    standard_monthly_hours INTEGER NOT NULL DEFAULT 72, -- Норма часов в месяц (норма 720 ч/год)
    education_sector_bonus_percent NUMERIC(5, 2) NOT NULL DEFAULT 40.00, -- Специфика образования (40%)
    curator_bonus_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00, -- Кураторство группы (80% от БС)
    cabinet_management_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.00, -- Заведование кабинетом (20% от БС)
    written_work_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.00, -- Проверка тетрадей (12% от часов)
    head_of_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 25.00, -- Руководство ЦК (25% от БС)
    income_tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 13.00, -- Подоходный налог (13% в РБ)
    pension_fund_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.00, -- ФСЗН с работника (1%)
    trade_union_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.00, -- Профсоюзный взнос (1%)
    child_tax_deduction NUMERIC(10, 2) NOT NULL DEFAULT 51.00, -- Вычет на ребенка (51 BYN)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ТАБЛИЦА ПРЕПОДАВАТЕЛЕЙ (ШТАТНОЕ РАСПИСАНИЕ)
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    tab_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    qualification_category TEXT NOT NULL CHECK (qualification_category IN ('NONE', 'SECOND', 'FIRST', 'HIGHER', 'METHODIST')),
    experience_years INTEGER NOT NULL DEFAULT 0,
    education_level TEXT NOT NULL,
    is_group_curator BOOLEAN NOT NULL DEFAULT FALSE,
    curator_group_name TEXT,
    has_cabinet_management BOOLEAN NOT NULL DEFAULT FALSE,
    cabinet_name TEXT,
    has_written_work_check BOOLEAN NOT NULL DEFAULT FALSE,
    is_head_of_cycle_commission BOOLEAN NOT NULL DEFAULT FALSE,
    tariff_rank INTEGER NOT NULL DEFAULT 9,
    is_trade_union_member BOOLEAN NOT NULL DEFAULT TRUE,
    has_children_tax_deduction BOOLEAN NOT NULL DEFAULT FALSE,
    children_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ И ДОСТУПОВ (АДМИНИСТРАТИВНЫЙ МОДУЛЬ)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('TEACHER', 'ACCOUNTANT', 'ADMIN')),
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ТАБЛИЦА НАЧИСЛЕНИЙ ЗАРПЛАТЫ (РАСЧЕТНЫЕ ЛИСТКИ)
CREATE TABLE IF NOT EXISTS payroll_records (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    period_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'CALCULATED', 'PAID')),
    academic_hours_worked NUMERIC(6, 2) NOT NULL DEFAULT 0,
    
    -- Начисления (Gross)
    tariff_salary NUMERIC(10, 2) NOT NULL DEFAULT 0,
    specific_education_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    category_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    experience_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    curator_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cabinet_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    written_work_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    head_of_commission_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kpi_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
    gross_total NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Удержания
    income_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    pension_fund NUMERIC(10, 2) NOT NULL DEFAULT 0,
    trade_union NUMERIC(10, 2) NOT NULL DEFAULT 0,
    advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deductions_total NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Итог на руки (Net)
    net_payable NUMERIC(10, 2) NOT NULL DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ТАБЛИЦА ЖУРНАЛА АУДИТА БЕЗОПАСНОСТИ
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL
);

-- ==============================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- ==============================================================================

INSERT INTO payroll_settings (id, college_name, chief_accountant_name, base_rate)
VALUES (
    'current',
    'УО «Гомельский государственный машиностроительный колледж»',
    'Ковалёва Е.С.',
    270.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (
    id, full_name, tab_number, department, position, qualification_category,
    experience_years, education_level, is_group_curator, curator_group_name,
    has_cabinet_management, cabinet_name, has_written_work_check,
    is_head_of_cycle_commission, tariff_rank, is_trade_union_member,
    has_children_tax_deduction, children_count
) VALUES
('t-1', 'Ковалёв Дмитрий Сергеевич', 'ТН-0102', 'Отделение информационных технологий', 'Преподаватель спецдисциплин', 'HIGHER', 16, 'Высшее (ГГТУ им. Сухого, РИПО)', TRUE, 'гр. 24-ПО-1', TRUE, 'Каб. 314 «Лаборатория системного программирования»', FALSE, TRUE, 11, TRUE, TRUE, 1),
('t-2', 'Мороз Ольга Николаевна', 'ТН-0145', 'Отделение общеобразовательных дисциплин', 'Преподаватель математики и информатики', 'FIRST', 8, 'Высшее (ГГУ им. Ф. Скорины)', TRUE, 'гр. 25-МТ-2', FALSE, NULL, TRUE, FALSE, 9, TRUE, TRUE, 2),
('t-3', 'Василевич Артём Игоревич', 'ТН-0210', 'Отделение машиностроения и металлообработки', 'Преподаватель технологии машиностроения', 'NONE', 2, 'Высшее (ГГТУ им. Сухого, молодой специалист)', FALSE, NULL, TRUE, 'Каб. 108 «Мастерская обработки материалов»', FALSE, FALSE, 8, TRUE, FALSE, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, username, email, password, full_name, role, teacher_id, is_active)
VALUES
('u-admin', 'admin', 'admin@ggmk.by', 'admin2026', 'Сидоров Михаил Петрович (Системный администратор)', 'ADMIN', NULL, TRUE),
('u-buh', 'buhgalter', 'buh@ggmk.by', 'buh2026', 'Ковалёва Елена Станиславовна (Главный бухгалтер)', 'ACCOUNTANT', NULL, TRUE),
('u-t1', 'kovalev.ds', 'kovalev.ds@ggmk.by', 'kovalev26', 'Ковалёв Дмитрий Сергеевич', 'TEACHER', 't-1', TRUE),
('u-t2', 'moroz.on', 'moroz.on@ggmk.by', 'moroz26', 'Мороз Ольга Николаевна', 'TEACHER', 't-2', TRUE),
('u-t3', 'vasilevich.ai', 'vasilevich.ai@ggmk.by', 'vasilevich26', 'Василевич Артём Игоревич', 'TEACHER', 't-3', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ПОЛИТИКИ БЕЗОПАСНОСТИ (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_payroll_settings ON payroll_settings;
CREATE POLICY p_payroll_settings ON payroll_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_teachers ON teachers;
CREATE POLICY p_teachers ON teachers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_users ON users;
CREATE POLICY p_users ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_payroll_records ON payroll_records;
CREATE POLICY p_payroll_records ON payroll_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_audit_logs ON audit_logs;
CREATE POLICY p_audit_logs ON audit_logs FOR ALL USING (true) WITH CHECK (true);


