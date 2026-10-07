import React from 'react';
import { User, Teacher } from '../types';
import { Building2, UserCircle2, Shield } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  teachers: Teacher[];
  collegeName: string;
  onSwitchUser: (user: User) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  teachers,
  collegeName,
  onSwitchUser,
  onOpenAdmin,
}) => {
  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-800 shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Логотип и колледж */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-forest-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm md:text-base font-bold tracking-tight text-white leading-tight">
              {collegeName}
            </div>
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-2 mt-0.5">
              <span>Система расчета оплаты труда педагогических работников (РБ)</span>
            </div>
          </div>
        </div>

        {/* Профиль и быстрое переключение ролей для демонстрации */}
        <div className="flex items-center gap-3">
          {/* Селектор демонстрации пользователей */}
          <div className="hidden sm:flex items-center bg-emerald-900/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 gap-2">
            <UserCircle2 className="w-4 h-4 text-emerald-300" />
            <div className="text-xs">
              <span className="text-emerald-400 block text-[10px] uppercase font-semibold">Войти под профилем:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = allUsers.find((u) => u.id === e.target.value);
                  if (target) onSwitchUser(target);
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                {allUsers
                  .filter((u) => u.role !== 'ADMIN')
                  .map((u) => {
                    const t = teachers.find((tc) => tc.id === u.teacherId);
                    return (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.role === 'ACCOUNTANT' ? '★ Бухгалтер: ' : 'Педагог: '}
                        {u.fullName} {t ? `(${t.tabNumber})` : ''}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          {/* Кнопка перехода в отдельный кабинет администратора */}
          <button
            onClick={onOpenAdmin}
            title="Перейти в отдельный изолированный кабинет администратора"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 transition-colors shadow-sm"
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="hidden md:inline">Кабинет администратора</span>
            <span className="md:hidden">Админ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
