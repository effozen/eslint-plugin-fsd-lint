import { authService } from '../../auth/model/authService';
import { User } from '@entities/user';

export const profileService = {
  updateProfile: async (user: User) => {
    // 잘못된 예시: 다른 feature의 내부 서비스 직접 사용
    await authService.login({ email: user.email, password: '' });
    return { success: true };
  },
};
