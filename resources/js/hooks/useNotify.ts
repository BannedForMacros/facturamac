import toast from 'react-hot-toast';

export const useNotify = () => ({
    success: (msg: string) =>
        toast.success(msg, {
            duration: 4000,
            style: { fontSize: '14px' },
        }),
    error: (msg: string) =>
        toast.error(msg, {
            duration: 5000,
            style: { fontSize: '14px' },
        }),
    warning: (msg: string) =>
        toast(msg, {
            duration: 4000,
            icon: '⚠️',
            style: { fontSize: '14px' },
        }),
    info: (msg: string) =>
        toast(msg, {
            duration: 4000,
            icon: 'ℹ️',
            style: { fontSize: '14px' },
        }),
    loading: (msg: string) =>
        toast.loading(msg, { style: { fontSize: '14px' } }),
    dismiss: (id?: string) => toast.dismiss(id),
});
