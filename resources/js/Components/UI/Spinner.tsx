import { Loader2 } from 'lucide-react';

interface SpinnerProps {
    size?: number;
    className?: string;
    label?: string;
}

export default function Spinner({ size = 20, className = 'text-blue-600', label }: SpinnerProps) {
    return (
        <div className="flex items-center gap-2">
            <Loader2 size={size} className={`animate-spin ${className}`} />
            {label && <span className="text-sm text-gray-500">{label}</span>}
        </div>
    );
}
