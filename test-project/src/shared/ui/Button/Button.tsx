import React from 'react';
import { ButtonProps } from './types';
import styles from './Button.module.css';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
      disabled={isLoading}
      {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
