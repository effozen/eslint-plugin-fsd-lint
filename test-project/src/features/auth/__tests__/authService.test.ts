import { authService } from '../model/authService';
import { userReducer } from '@entities/user/model/slice';
import { LoginForm } from '../ui/LoginForm';

describe('authService', () => {
  it('should not allow direct imports from internal files', () => {
    // 이 테스트는 린트 에러를 발생시켜야 합니다
    expect(userReducer).toBeDefined();
    expect(LoginForm).toBeDefined();
  });

  it('should use public API for imports', () => {
    // 이 테스트는 린트 에러를 발생시키지 않아야 합니다
    import('@entities/user').then(({ User }) => {
      expect(User).toBeDefined();
    });
  });
});
