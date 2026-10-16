import type React from 'react';

export function NavSkeletonBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

