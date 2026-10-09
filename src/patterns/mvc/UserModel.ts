// ==============================================================================
// ПАТТЕРН MVC: MODEL (Модель данных пользователей)
// Отвечает за: хранение состояния, бизнес-правила валидации, взаимодействие с БД
// ==============================================================================

import { User } from '../../types';
import { StorageService } from '../../services/storage';
import { DatabaseService } from '../../services/supabase';

type ModelListener = (users: User[]) => void;

export class UserModel {
  private users: User[] = [];
  private listeners: ModelListener[] = [];

  constructor() {
    this.users = StorageService.getUsers();
  }

  // Подписка на изменение модели (Observer)
  public subscribe(listener: ModelListener): () => void {
    this.listeners.push(listener);
    listener(this.users);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l([...this.users]));
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  // Бизнес-валидация данных пользователя
  public validate(user: Partial<User>, isNew: boolean = false): { valid: boolean; error?: string } {
    if (!user.fullName || user.fullName.trim().length < 3) {
      return { valid: false, error: 'ФИО должно содержать минимум 3 символа' };
    }
    if (!user.username || user.username.trim().length < 3) {
      return { valid: false, error: 'Логин должен содержать минимум 3 символа' };
    }
    if (!user.email || !user.email.includes('@')) {
      return { valid: false, error: 'Некорректный формат адреса электронной почты' };
    }
    if (!user.password || user.password.length < 4) {
      return { valid: false, error: 'Пароль должен быть не короче 4 символов' };
    }

    // Проверка уникальности логина
    const existing = this.users.find((u) => u.username.toLowerCase() === user.username?.toLowerCase());
    if (existing && (isNew || existing.id !== user.id)) {
      return { valid: false, error: 'Пользователь с таким логином уже существует' };
    }

    return { valid: true };
  }

  // Операции модификации модели
  public async saveUser(user: User): Promise<boolean> {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }

    // Сохранение в LocalStorage и Supabase (если настроен)
    StorageService.saveUser(user);
    await DatabaseService.saveUser(user);

    this.notify();
    return true;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    this.users = this.users.filter((u) => u.id !== userId);
    StorageService.deleteUser(userId);
    this.notify();
    return true;
  }
}
