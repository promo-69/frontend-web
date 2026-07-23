import React from 'react'
import Button from './Button'

function FormActions({
  onCancel,
  onSubmit,
  cancelText = 'Cancelar',
  submitText = 'Guardar',
  loadingText,
  isLoading = false,
  disabled = false,
  showCancel = true,
}) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      {showCancel && (
        <Button
          text={cancelText}
          type="button"
          onClick={onCancel || (() => window.history.back())}
          className="!bg-white/10 !text-white hover:!bg-white/20 flex-1 w-full"
        />
      )}
      <Button
        text={isLoading ? (loadingText || 'Cargando...') : submitText}
        type="submit"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        isLoading={isLoading}
        className="flex-1 w-full"
      />
    </div>
  )
}

export default FormActions
