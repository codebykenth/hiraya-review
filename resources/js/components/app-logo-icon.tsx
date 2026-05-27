import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/hiraya_logo.png"
            alt="Hiraya CSE Logo"
            className={className}
            {...props}
        />
    );
}

