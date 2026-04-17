type ToastContext = 'dashboard' | 'login'

interface ToastColors {
  bg: string
  title: string
}

type ToastType = 'success' | 'error' | 'warning' | 'info'

const dashboardColors: Record<ToastType, ToastColors> = {
  success: { bg: '#cbe3dc', title: '#1A624C' },
  error: { bg: '#FFEBEB', title: '#A01110' },
  warning: { bg: '#FFF5E2', title: '#534B2C' },
  info: { bg: '#EBF6FE', title: '#27587D' },
}

const loginColors: Record<Exclude<ToastType, 'info'>, ToastColors> = {
  error: { bg: '#F7C8C8', title: '#A01110' },
  warning: { bg: '#F8F1D4', title: '#534B2C' },
  success: { bg: '#CBE3DC', title: '#1A624C' },
}

function getColors(type: ToastType, context: ToastContext): ToastColors {
  if (context === 'login' && type in loginColors) {
    return loginColors[type as keyof typeof loginColors]
  }
  return dashboardColors[type]
}

export function useWompiToast(context: ToastContext = 'dashboard') {
  const toast = useToast()

  function show(type: ToastType, title: string, description?: string) {
    const colors = getColors(type, context)

    toast.add({
      title,
      description,
      ui: {
        background: '',
        ring: '',
        title: '',
        rounded: 'rounded-lg',
      },
      style: {
        backgroundColor: colors.bg,
        color: colors.title,
      },
    })
  }

  return {
    success: (title: string, description?: string) => show('success', title, description),
    error: (title: string, description?: string) => show('error', title, description),
    warning: (title: string, description?: string) => show('warning', title, description),
    info: (title: string, description?: string) => show('info', title, description),
  }
}
