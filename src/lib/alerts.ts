import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { toast } from 'sonner'

const MySwal = withReactContent(Swal)

// Custom Dark Mode SweetAlert2 configuration
const customSwal = MySwal.mixin({
  customClass: {
    popup: 'bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-6 font-sans',
    title: 'text-lg font-bold text-white',
    htmlContainer: 'text-xs text-slate-300',
    confirmButton: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 mx-1.5 transition',
    cancelButton: 'px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold mx-1.5 transition',
    denyButton: 'px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold mx-1.5 transition',
  },
  buttonsStyling: false,
  background: '#0f172a',
  color: '#f8fafc',
})

export const alerts = {
  // Toast notifications via Sonner (Sleek, stacked, modern)
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 3500,
    })
  },

  // Modal Confirmations via SweetAlert2 (Dark themed, friendly, customizable)
  confirm: async ({
    title,
    text,
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar',
    icon = 'warning',
    isDanger = false,
  }: {
    title: string
    text: string
    confirmButtonText?: string
    cancelButtonText?: string
    icon?: 'warning' | 'error' | 'info' | 'question' | 'success'
    isDanger?: boolean
  }): Promise<boolean> => {
    const result = await customSwal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      customClass: {
        popup: 'bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-6 font-sans',
        title: 'text-lg font-bold text-white',
        htmlContainer: 'text-xs text-slate-300',
        confirmButton: isDanger
          ? 'px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 mx-1.5 transition'
          : 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 mx-1.5 transition',
        cancelButton: 'px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold mx-1.5 transition',
      },
    })
    return result.isConfirmed
  },

  // Modal alert dialog
  alert: async ({
    title,
    text,
    icon = 'info',
  }: {
    title: string
    text: string
    icon?: 'warning' | 'error' | 'info' | 'question' | 'success'
  }) => {
    await customSwal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Entendido',
    })
  },
}
