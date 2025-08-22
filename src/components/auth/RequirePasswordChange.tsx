import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RequirePasswordChangeProps {
  children: React.ReactNode;
}

export default function RequirePasswordChange({ children }: RequirePasswordChangeProps) {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si el usuario debe cambiar contraseña y no está en la página de cambio
    if (authState.user?.debe_cambiar_password && location.pathname !== '/change-password') {
      navigate('/change-password', { replace: true });
    }
  }, [authState.user?.debe_cambiar_password, location.pathname, navigate]);

  // Si debe cambiar contraseña pero no está en la página correcta, no renderizar nada
  if (authState.user?.debe_cambiar_password && location.pathname !== '/change-password') {
    return null;
  }

  return <>{children}</>;
}