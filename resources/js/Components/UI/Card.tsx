import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
}

Card.Header = function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

Card.Body = function CardBody({ children, className = '' }: CardProps) {
    return <div className={`p-6 ${className}`}>{children}</div>;
};

export default Card;
