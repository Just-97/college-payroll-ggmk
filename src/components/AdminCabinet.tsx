import React, { useState } from 'react';
import { User, UserRole, Teacher, AuditLog } from '../types';
import {
  ShieldAlert, UserPlus, KeyRound, Mail, UserCheck, Trash2, Edit,
  Eye, EyeOff, ShieldCheck, History, ArrowLeft, RefreshCw, X, Lock
} from 'lucide-react';

interface AdminCabinetProps {
  users: User[];
  teachers: Teacher[];
  auditLogs: AuditLog[];
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onNavigateToPortal: () => void;
}

export const AdminCabinet: React.FC<AdminCabinetProps> = ({
  users,
  teachers,
  auditLogs,
  onSaveUser,
  onDeleteUser,
  onNavigateToPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT'>('USERS');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту учетную запись?')) {
      onDeleteUser(userId);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* ИЗОЛИРОВАННАЯ ШАПКА АДМИНИСТРАТОРА (ТЕМНО-ИЗУМРУДНЫЙ / СТРОГИЙ СТИЛЬ) */}
      <header className="bg-slate-950 border-b border-emerald-900/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <ShieldAlert className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Панель Системного Администратора
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  /admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Управление учетными записями, доступами и безопасностью портала колледжа
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

      {/* ОСНОВНОЙ КОНТЕНТ АДМИНИСТРИРОВАНИЯ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Информационный баннер безопасности */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Управление учетными данными сотрудников
              </h2>
              <p className="text-xs text-slate-400">
                Администратор имеет полный доступ к просмотру и управлению логинами, паролями и ролями пользователей.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateUser}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/40 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Создать пользователя
          </button>
        </div>

        {/* Навигация по вкладкам */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'USERS'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Пользователи и пароли ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'AUDIT'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Журнал аудита ({auditLogs.length})
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

        {/* ВКЛАДКА ПОЛЬЗОВАТЕЛИ */}
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
                    <th className="px-4 py-3.5 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {filteredUsers.map((u) => {
                    const linkedTeacher = teachers.find((t) => t.id === u.teacherId);
                    const isPassVisible = !!showPasswords[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {u.fullName}
                        </td>
                        <td className="px-3 py-3 font-mono text-emerald-400 font-medium">
                          {u.username}
                        </td>
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
                            {u.role === 'ADMIN'
                              ? 'АДМИНИСТРАТОР'
                              : u.role === 'ACCOUNTANT'
                              ? 'БУХГАЛТЕР'
                              : 'ПРЕПОДАВАТЕЛЬ'}
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
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              u.isActive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            {u.isActive ? 'Активен' : 'Заблокирован'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditUser(u)}
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

        {/* ВКЛАДКА ЖУРНАЛ АУДИТА */}
        {activeTab === 'AUDIT' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Журнал событий и операций системы
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
      </main>

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ */}
      {isModalOpen && (
        <UserModal
          user={editingUser}
          teachers={teachers}
          onClose={() => setIsModalOpen(false)}
          onSave={(saved) => {
            onSaveUser(saved);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user: User | null;
  teachers: Teacher[];
  onClose: () => void;
  onSave: (user: User) => void;
}

function UserModal({ user, teachers, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<User>(
    user || {
      id: 'u-' + Date.now(),
      username: '',
      email: '',
      password: 'pass' + Math.floor(1000 + Math.random() * 9000),
      fullName: '',
      role: 'TEACHER',
      teacherId: teachers[0]?.id || '',
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  );

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: res });
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
      teacherId: role === 'TEACHER' ? (formData.teacherId || teachers[0]?.id) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-150">
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            {user ? 'Редактирование пользователя' : 'Создание нового пользователя'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ФИО полностью:</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Логин (username):</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="ivanov.ii"
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
                placeholder="ivanov@college.by"
              />
            </div>
          </div>

          {/* Пароль с кнопкой автогенерации */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-300 font-semibold">Пароль пользователя:</label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Сгенерировать надежный
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Роль доступа:</label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="TEACHER">Преподаватель</option>
                <option value="ACCOUNTANT">Бухгалтер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Статус аккаунта:</label>
              <select
                value={formData.isActive ? 'ACTIVE' : 'BLOCKED'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ACTIVE">Активен</option>
                <option value="BLOCKED">Заблокирован</option>
              </select>
            </div>
          </div>

          {formData.role === 'TEACHER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Привязка к карточке преподавателя (СПО):
              </label>
              <select
                value={formData.teacherId || ''}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.tabNumber} — {t.department})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Преподаватель сможет просматривать начисления только для этого табельного номера.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
