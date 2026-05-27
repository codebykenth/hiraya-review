interface BrandNameProps {
    className?: string;
}

export default function BrandName({ className = '' }: BrandNameProps) {
    return (
        <span className={className}>
            Hiraya <span className="text-primary font-black">CSE</span>
        </span>
    );
}
