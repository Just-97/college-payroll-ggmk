// ==============================================================================
// ПАТТЕРН MVC: VIEW (Представление администратора)
// Отвечает за: отображение данных Model, перехват кликов и делегирование в Controller
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { UserModel } from './UserModel';
import { AdminController } from './AdminController';
import { User, UserRole, Teacher, AuditLog } from '../../types';
import {
  ShieldAlert, UserPlus, KeyRound, Mail, UserCheck, Trash2, Edit,
  Eye, EyeOff, History, ArrowLeft, RefreshCw, X, Lock, Database,
  Check, AlertCircle, UploadCloud, Server
} from 'lucide-react';
import { isSupabaseConfigured, configureSupabaseClient, DatabaseService } from '../../services/supabase';
import { StorageService } from '../../services/storage';

interface AdminViewProps {
  model: UserModel;
  controller: AdminController;
  teachers: Teacher[];
  auditLogs: AuditLog[];
  onNavigateToPortal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  model,
  controller,
  teachers,
  auditLogs,
  onNavigateToPortal,
}) => {
  // Состояние View синхронизируется с Model (паттерн Observer в MVC)
  const [users, setUsers] = useState<User[]>(model.getUsers());
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT' | 'DATABASE'>('USERS');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Модальное окно пользователя
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Настройки подключения к Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_custom_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_custom_key') || ''
  );
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Подписка View на Model
    const unsubscribe = model.subscribe((updatedUsers) => {
      setUsers(updatedUsers);
    });
    return unsubscribe;
  }, [model]);

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSaveUser = async (userData: any) => {
    setErrorMessage(null);
    if (editingUser) {
      // Обновление
      const res = await controller.handleUpdateUser(userData);
      if (!res.success) {
        setErrorMessage(res.error || 'Ошибка обновления');
        return;
      }
    } else {
      // Создание
      const res = await controller.handleCreateUser(userData);
      if (!res.success) {
        setErrorMessage(res.error || 'Ошибка создания');
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту учетную запись?')) {
      await controller.handleDeleteUser(userId);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = configureSupabaseClient(supabaseUrl.trim(), supabaseKey.trim());
    setSupabaseConnected(ok);
    setTestResult(null);
    setSyncResult(null);
    alert(ok ? 'Параметры Supabase успешно сохранены!' : 'Подключение сброшено.');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await DatabaseService.testConnection();
      setTestResult(res);
      setSupabaseConnected(res.ok);
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Ошибка тестирования' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncData = async () => {
    if (!confirm('Выгрузить всех преподавателей, пользователей, настройки и начисления из локальной базы в облако Supabase?')) {
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await DatabaseService.syncAllLocalToSupabase({
        settings: StorageService.getSettings(),
        teachers: StorageService.getTeachers(),
        users: StorageService.getUsers(),
        payrolls: StorageService.getPayrolls(),
      });
      setSyncResult({ ok: res.success, message: res.message });
    } catch (err: any) {
      setSyncResult({ ok: false, message: err?.message || 'Ошибка синхронизации' });
    } finally {
      setIsSyncing(false);
    }
  };


  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* ИЗОЛИРОВАННАЯ ШАПКА АДМИНИСТРАТОРА (MVC VIEW) */}
      <header className="bg-slate-950 border-b border-emerald-900/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <ShieldAlert className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Панель Администратора (Архитектура MVC)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  /admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Модуль управления пользователями и доступами колледжа
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToPortal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться на основной портал
            </button>
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Баннер паттерна MVC и статуса БД */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Паттерн: Model-View-Controller (MVC)
              </span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1 ${supabaseConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                <Database className="w-3 h-3" />
                {supabaseConnected ? 'Supabase: Подключено' : 'База данных: Local/Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <strong>Model</strong> (UserModel) хранит данные и валидацию • <strong>Controller</strong> (AdminController) обрабатывает команды • <strong>View</strong> отображает интерфейс.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setEditingUser(null);
                setErrorMessage(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/40"
            >
              <UserPlus className="w-4 h-4" />
              Создать пользователя
            </button>
          </div>
        </div>

        {/* Навигация по вкладкам */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'USERS' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Пользователи и пароли ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'AUDIT' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Журнал аудита ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('DATABASE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'DATABASE' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Настройки Supabase
            </button>
          </div>

          {activeTab === 'USERS' && (
            <input
              type="text"
              placeholder="Поиск по ФИО, логину, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none w-64"
            />
          )}
        </div>

        {/* ВКЛАДКА: ПОЛЬЗОВАТЕЛИ (MVC VIEW TABLE) */}
        {activeTab === 'USERS' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-800">
                <thead className="bg-slate-900/90 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">ФИО сотрудника</th>
                    <th className="px-3 py-3.5">Логин</th>
                    <th className="px-3 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Пароль (доступ)</th>
                    <th className="px-3 py-3.5">Роль в системе</th>
                    <th className="px-3 py-3.5">Привязка преподавателя</th>
                    <th className="px-3 py-3.5 text-center">Статус</th>
                    <th className="px-4 py-3.5 text-center">Действия (Controller)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {filteredUsers.map((u) => {
                    const linkedTeacher = teachers.find((t) => t.id === u.teacherId);
                    const isPassVisible = !!showPasswords[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{u.fullName}</td>
                        <td className="px-3 py-3 font-mono text-emerald-400 font-medium">{u.username}</td>
                        <td className="px-3 py-3 text-slate-300 flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700/80">
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-mono text-xs text-amber-200">
                              {isPassVisible ? u.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-200 ml-1"
                              title={isPassVisible ? 'Скрыть пароль' : 'Показать пароль'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                                : u.role === 'ACCOUNTANT'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'АДМИНИСТРАТОР' : u.role === 'ACCOUNTANT' ? 'БУХГАЛТЕР' : 'ПРЕПОДАВАТЕЛЬ'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-300">
                          {linkedTeacher ? (
                            <span className="text-emerald-300 text-[11px]">
                              {linkedTeacher.tabNumber} ({linkedTeacher.department})
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => controller.handleToggleStatus(u.id)}
                            title="Кликните для смены статуса"
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline ${
                              u.isActive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            {u.isActive ? 'Активен' : 'Заблокирован'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setErrorMessage(null);
                                setIsModalOpen(true);
                              }}
                              title="Редактировать учетную запись"
                              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {u.id !== 'u-admin' && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                title="Удалить учетную запись"
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: ЖУРНАЛ АУДИТА */}
        {activeTab === 'AUDIT' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Журнал аудита действий
            </h3>
            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">{log.action}</span>
                      <span className="text-slate-500">• {log.userName}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-slate-500 shrink-0 font-mono text-[11px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА: НАСТРОЙКИ БАЗЫ ДАННЫХ SUPABASE */}
        {activeTab === 'DATABASE' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Подключение к облачной СУБД Supabase (PostgreSQL)
                </h3>
                <span className={`px-2.5 py-1 text-xs rounded-full font-bold flex items-center gap-1.5 ${supabaseConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {supabaseConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Подключено
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Локальный режим (Offline)
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Все изменения преподавателей, учетных записей и начислений автоматически сохраняются в PostgreSQL при активном подключении. Если параметры не заданы, система использует локальное хранилище.
              </p>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Project URL (VITE_SUPABASE_URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Anon Public API Key (VITE_SUPABASE_ANON_KEY):
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTesting || !supabaseUrl || !supabaseKey}
                      onClick={handleTestConnection}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Server className="w-4 h-4" />
                      {isTesting ? 'Проверка...' : 'Проверить соединение'}
                    </button>

                    <button
                      type="button"
                      disabled={isSyncing || !supabaseConnected}
                      onClick={handleSyncData}
                      className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 disabled:opacity-50 text-emerald-300 font-medium rounded-xl border border-emerald-800 transition-colors flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-4 h-4" />
                      {isSyncing ? 'Выгрузка...' : 'Выгрузить локальные данные в Supabase'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/40"
                  >
                    Сохранить параметры
                  </button>
                </div>
              </form>

              {/* Результат проверки соединения */}
              {testResult && (
                <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${testResult.ok ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-rose-950/60 border-rose-800 text-rose-200'}`}>
                  {testResult.ok ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testResult.ok ? 'Соединение успешно!' : 'Ошибка подключения'}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}

              {/* Результат выгрузки данных */}
              {syncResult && (
                <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${syncResult.ok ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' : 'bg-rose-950/60 border-rose-800 text-rose-200'}`}>
                  {syncResult.ok ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{syncResult.ok ? 'Синхронизация завершена' : 'Ошибка синхронизации'}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{syncResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Пошаговая инструкция */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                📋 Пошаговая инструкция подключения Supabase
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  Перейдите на сайт <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">supabase.com</a> и войдите через GitHub или создайте аккаунт.
                </li>
                <li>
                  Нажмите <strong>«New project»</strong>, задайте имя проекта (например, <code className="text-emerald-300">ggmk-payroll</code>), пароль базы данных и выберите ближайший регион (например, Frankfurt/EU).
                </li>
                <li>
                  В меню слева откройте <strong>SQL Editor</strong> $\rightarrow$ <strong>«New query»</strong>.
                </li>
                <li>
                  Скопируйте весь код из файла <code className="text-emerald-300">supabase/schema.sql</code> вашего репозитория, вставьте в редактор Supabase и нажмите зелёную кнопку <strong>Run</strong>.
                </li>
                <li>
                  В меню проекта перейдите в <strong>Project Settings $\rightarrow$ API</strong> (или <strong>Connect</strong>) и скопируйте:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-400 font-mono text-[11px]">
                    <li><strong>Project URL</strong> (формата <code className="text-slate-300">https://xxxx.supabase.co</code>)</li>
                    <li><strong>anon public key</strong> (длинный JWT токен)</li>
                  </ul>
                </li>
                <li>
                  Вставьте эти два значения в форму выше и нажмите <strong>«Сохранить параметры»</strong>, затем нажмите <strong>«Проверить соединение»</strong>!
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>


      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ */}
      {isModalOpen && (
        <UserEditModal
          user={editingUser}
          teachers={teachers}
          controller={controller}
          errorMessage={errorMessage}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

// Вспомогательный диалог формы
function UserEditModal({
  user,
  teachers,
  controller,
  errorMessage,
  onClose,
  onSave,
}: {
  user: User | null;
  teachers: Teacher[];
  controller: AdminController;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState<User>(
    user || {
      id: 'u-' + Date.now(),
      username: '',
      email: '',
      password: controller.generateSecurePassword(),
      fullName: '',
      role: 'TEACHER',
      teacherId: teachers[0]?.id || '',
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            {user ? 'Редактирование пользователя (MVC View)' : 'Создание пользователя (MVC View)'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ФИО полностью:</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Логин:</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email:</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-300 font-semibold">Пароль:</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: controller.generateSecurePassword() })}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Сгенерировать
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Роль:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({
                  ...formData,
                  role: e.target.value as UserRole,
                  teacherId: e.target.value === 'TEACHER' ? (formData.teacherId || teachers[0]?.id) : undefined
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="TEACHER">Преподаватель</option>
                <option value="ACCOUNTANT">Бухгалтер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Статус:</label>
              <select
                value={formData.isActive ? 'ACTIVE' : 'BLOCKED'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="ACTIVE">Активен</option>
                <option value="BLOCKED">Заблокирован</option>
              </select>
            </div>
          </div>

          {formData.role === 'TEACHER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Привязка преподавателя:</label>
              <select
                value={formData.teacherId || ''}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-emerald-300"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.tabNumber} — {t.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Отмена
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
