import React, { useState, useEffect } from 'react';
import { User, Teacher, PayrollRecord, PayrollFormulaSettings, AuditLog } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { TeacherCabinet } from './components/TeacherCabinet';
import { AccountantCabinet } from './components/AccountantCabinet';
import { AdminCabinet } from './components/AdminCabinet';

export const App: React.FC = () => {
  // Состояния приложения
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [settings, setSettings] = useState<PayrollFormulaSettings>(StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Флаг нахождения в изолированном кабинете администратора
  const [isAdminPage, setIsAdminPage] = useState<boolean>(
    window.location.hash === '#/admin'
  );

  // Загрузка начальных данных из StorageService
  useEffect(() => {
    setUsers(StorageService.getUsers());
    setTeachers(StorageService.getTeachers());
    setRecords(StorageService.getPayrolls());
    setSettings(StorageService.getSettings());
    setAuditLogs(StorageService.getAuditLogs());
    setCurrentUser(StorageService.getCurrentUser());

    // Слушатель изменения hash в адресной строке браузера
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

  // Сохранение расчета
  const handleSaveRecord = (record: PayrollRecord) => {
    StorageService.savePayroll(record);
    setRecords(StorageService.getPayrolls());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Удаление расчета
  const handleDeleteRecord = (id: string) => {
    StorageService.deletePayroll(id);
    setRecords(StorageService.getPayrolls());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Сохранение настроек формул
  const handleSaveSettings = (updatedSettings: PayrollFormulaSettings) => {
    StorageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Сохранение преподавателя
  const handleSaveTeacher = (teacher: Teacher) => {
    StorageService.saveTeacher(teacher);
    setTeachers(StorageService.getTeachers());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Сохранение пользователя (из админки)
  const handleSaveUser = (user: User) => {
    StorageService.saveUser(user);
    setUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    // Если обновился текущий пользователь
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  // Удаление пользователя (из админки)
  const handleDeleteUser = (userId: string) => {
    StorageService.deleteUser(userId);
    setUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Переключение пользователя на портале
  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка данных...</div>;
  }

  // 1. ИЗОЛИРОВАННАЯ СТРАНИЦА: КАБИНЕТ АДМИНИСТРАТОРА (/admin)
  if (isAdminPage) {
    return (
      <AdminCabinet
        users={users}
        teachers={teachers}
        auditLogs={auditLogs}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        onNavigateToPortal={navigateToPortal}
      />
    );
  }

  // 2. ОСНОВНОЙ САЙТ / ПОРТАЛ КОЛЛЕДЖА (ПРЕПОДАВАТЕЛЬ / БУХГАЛТЕР)
  const linkedTeacher = teachers.find((t) => t.id === currentUser.teacherId) || teachers[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Шапка портала */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        teachers={teachers}
        collegeName={settings.collegeName}
        onSwitchUser={handleSwitchUser}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Основной контент */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentUser.role === 'ACCOUNTANT' ? (
          /* АРМ БУХГАЛТЕРА: полный доступ ко всем расчетам и преподавателям */
          <AccountantCabinet
            teachers={teachers}
            records={records}
            settings={settings}
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            onSaveSettings={handleSaveSettings}
            onSaveTeacher={handleSaveTeacher}
          />
        ) : (
          /* ЛИЧНЫЙ КАБИНЕТ ПРЕПОДАВАТЕЛЯ: строго просмотр своего листка и печать */
          <TeacherCabinet
            teacher={linkedTeacher}
            records={records}
            settings={settings}
          />
        )}
      </main>

      {/* Подвал портала */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} {settings.collegeName}. Расчет заработной платы педагогов по нормам РБ.
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
