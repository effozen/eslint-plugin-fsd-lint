// 잘못된 예시: entities 레이어의 내부 파일을 직접 임포트
import { userReducer } from '@entities/user/model/slice';
import { User } from '@entities/user/model/types';

// 올바른 예시: public API를 통한 임포트
import { User as UserType } from '@entities/user';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    // 잘못된 예시: UI 컴포넌트를 비즈니스 로직에서 직접 임포트
    import { LoginForm } from '../ui/LoginForm';

    // 잘못된 예시: 다른 feature의 내부 파일을 직접 임포트
    import { profileReducer } from '@features/profile/model/slice';

    return { success: true };
  },
};
