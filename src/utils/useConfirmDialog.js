// src/hooks/useConfirmDialog.js
import { useState, useCallback } from 'react';

const useConfirmDialog = () => {
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'delete',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const showDialog = useCallback((config) => {
    setDialogConfig({
      isOpen: true,
      ...config
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogConfig.onConfirm) {
      dialogConfig.onConfirm();
    }
    hideDialog();
  }, [dialogConfig, hideDialog]);

  return {
    dialogConfig: {
      ...dialogConfig,
      onClose: hideDialog,
      onConfirm: handleConfirm
    },
    showDialog,
    hideDialog
  };
};

export default useConfirmDialog;