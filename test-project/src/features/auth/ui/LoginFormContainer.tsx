import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoginForm } from './LoginForm';
import { authReducer } from '../model/slice';
import { LoginCredentials } from '../model/types';
import { userReducer } from '../../../entities/user/model/slice';

export const LoginFormContainer: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);

  const handleLogin = async (credentials: LoginCredentials) => {
    // 잘못된 예시: 상대 경로로 다른 feature의 내부 파일 임포트
    const { profileReducer } = await import('../../profile/model/slice');

    // 잘못된 예시: 상대 경로로 entities의 내부 파일 임포트
    const { userTypes } = await import('../../../entities/user/model/types');
  };

  return <LoginForm />;
};
