import React from 'react';
import { LoginForm } from '@features/auth';

export const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>로그인</h1>
      <LoginForm />
    </div>
  );
};
