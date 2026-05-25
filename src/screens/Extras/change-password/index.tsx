import React from 'react';
import { useChangePasswordViewModel } from './useChangePasswordViewModel';
import { ChangePasswordView } from './ChangePasswordView';

const ChangePasswordScreen = () => {
  const vm = useChangePasswordViewModel();
  return <ChangePasswordView vm={vm} />;
};

export default ChangePasswordScreen;
