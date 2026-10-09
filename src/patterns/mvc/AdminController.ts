// ==============================================================================
// ПАТТЕРН MVC: CONTROLLER (Контроллер администратора)
// Отвечает за: обработку действий пользователя из View, валидацию и вызов методов Model
// ==============================================================================

import { UserModel } from './UserModel';
import { User, UserRole } from '../../types';

export class AdminController {
  private model: UserModel;

  constructor(model: UserModel) {
    this.model = model;
  }

  // Обработка создания пользователя
  public async handleCreateUser(userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    teacherId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const newUser: User = {
      id: 'u-' + Date.now(),
      fullName: userData.fullName.trim(),
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim(),
      password: userData.password,
      role: userData.role,
      teacherId: userData.role === 'TEACHER' ? userData.teacherId : undefined,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const validation = this.model.validate(newUser, true);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    await this.model.saveUser(newUser);
    return { success: true };
  }

  // Обработка обновления пользователя
  public async handleUpdateUser(user: User): Promise<{ success: boolean; error?: string }> {
    const validation = this.model.validate(user, false);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    await this.model.saveUser(user);
    return { success: true };
  }

  // Обработка удаления пользователя
  public async handleDeleteUser(userId: string): Promise<boolean> {
    if (userId === 'u-admin') {
      alert('Нельзя удалить главного системного администратора');
      return false;
    }
    return await this.model.deleteUser(userId);
  }

  // Обработка переключения статуса блокировки
  public async handleToggleStatus(userId: string): Promise<void> {
    const user = this.model.getUserById(userId);
    if (!user) return;
    user.isActive = !user.isActive;
    await this.model.saveUser(user);
  }

  // Генератор случайного надежного пароля
  public generateSecurePassword(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }
}
