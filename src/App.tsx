import React, { useState, useEffect, useMemo } from 'react';
import { User, Teacher, AuditLog } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';

// 1. Паттерн MVC (Model-View-Controller) для модуля администрирования
import { UserModel } from './patterns/mvc/UserModel';
import { AdminController } from './patterns/mvc/AdminController';
import { AdminView } from './patterns/mvc/AdminView';

// 2. Паттерн MVP (Model-View-Presenter) для модуля расчетного листка преподавателя
import { PayrollModel } from './patterns/mvp/PayrollModel';
import { PayslipPresenter } from './patterns/mvp/PayslipPresenter';
import { PayslipView } from './patterns/mvp/PayslipView';

// 3. Паттерн MVVM (Model-View-ViewModel) для модуля рабочего места бухгалтера
import { AccountantModel } from './patterns/mvvm/AccountantModel';
import { AccountantView } from './patterns/mvvm/AccountantView';

export const App: React.FC = () => {
  // Состояния приложения
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Флаг нахождения в изолированном кабинете администратора (/admin)
  const [isAdminPage, setIsAdminPage] = useState<boolean>(
    window.location.hash === '#/admin'
  );

  // 1. Инициализация MVC для административного модуля
  const userModel = useMemo(() => new UserModel(), []);
  const adminController = useMemo(() => new AdminController(userModel), [userModel]);

  // 3. Инициализация MVVM для модуля бухгалтера
  const accountantModel = useMemo(() => new AccountantModel(), []);

  // Загрузка начальных данных
  useEffect(() => {
    setUsers(StorageService.getUsers());
    setTeachers(StorageService.getTeachers());
    setAuditLogs(StorageService.getAuditLogs());
    setCurrentUser(StorageService.getCurrentUser());

    // Слушатель изменения hash в адресной строке
    const handleHashChange = () => {
      setIsAdminPage(window.location.hash === '#/admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Переход в кабинет администратора (отдельная страница /admin)
  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
    setIsAdminPage(true);
  };

  // Возврат на основной портал
  const navigateToPortal = () => {
    window.location.hash = '';
    setIsAdminPage(false);
  };

  // Переключение пользователя на портале
  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка данных...</div>;
  }

  // 1. ИЗОЛИРОВАННАЯ СТРАНИЦА: КАБИНЕТ АДМИНИСТРАТОРА (ПАТТЕРН MVC)
  if (isAdminPage) {
    return (
      <AdminView
        model={userModel}
        controller={adminController}
        teachers={teachers}
        auditLogs={auditLogs}
        onNavigateToPortal={navigateToPortal}
      />
    );
  }

  // 2. ОСНОВНОЙ САЙТ / ПОРТАЛ КОЛЛЕДЖА (ПРЕПОДАВАТЕЛЬ / БУХГАЛТЕР)
  const linkedTeacher = teachers.find((t) => t.id === currentUser.teacherId) || teachers[0];
  const settings = StorageService.getSettings();

  // 2. Инициализация MVP для расчетного листка выбранного преподавателя
  const payrollModel = new PayrollModel(linkedTeacher, settings);
  const payslipPresenter = new PayslipPresenter(payrollModel);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-['Inter',sans-serif]">
      {/* Шапка портала */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        teachers={teachers}
        collegeName={settings.collegeName}
        onSwitchUser={handleSwitchUser}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Информационный бейдж паттернов */}
      <div className="bg-emerald-900 text-white text-[11px] py-1.5 px-4 no-print border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-300">Архитектура ТРПО:</span>
            <span className={`px-2 py-0.5 rounded ${currentUser.role === 'ACCOUNTANT' ? 'bg-emerald-500 text-emerald-950 font-bold' : 'bg-emerald-800 text-emerald-200'}`}>
              MVVM: АРМ Бухгалтера
            </span>
            <span className={`px-2 py-0.5 rounded ${currentUser.role === 'TEACHER' ? 'bg-emerald-500 text-emerald-950 font-bold' : 'bg-emerald-800 text-emerald-200'}`}>
              MVP: ЛК Преподавателя
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
              MVC: Панель Администратора (/admin)
            </span>
          </div>

          <div className="text-emerald-300">
            База данных: Supabase (PostgreSQL) + Local Storage
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentUser.role === 'ACCOUNTANT' ? (
          /* АРМ БУХГАЛТЕРА: Реализован через паттерн MVVM */
          <AccountantView model={accountantModel} />
        ) : (
          /* ЛИЧНЫЙ КАБИНЕТ ПРЕПОДАВАТЕЛЯ: Реализован через паттерн MVP */
          <PayslipView presenter={payslipPresenter} />
        )}
      </main>

      {/* Подвал портала */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} {settings.collegeName}. Архитектурные паттерны MVC, MVP, MVVM.
          </div>
          <div className="flex items-center gap-4 text-emerald-800 font-medium">
            <span>Ст. 80 ТК РБ</span>
            <span>Указ № 27</span>
            <span>Постановление Минобразования РБ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
