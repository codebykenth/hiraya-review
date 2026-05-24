import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Shield Outline */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2L3 6v6c0 5.52 3.8 10.74 9 12 5.2-1.26 9-6.48 9-12V6l-9-4zm7 10c0 4.11-2.52 7.84-7 8.92-4.48-1.08-7-4.81-7-8.92V7.32l7-3.11 7 3.11V12z"
            />
            {/* Graduation Cap - Mortarboard Diamond */}
            <path d="M12 6.5l4.5 2.25L12 11 7.5 8.75 12 6.5z" />
            {/* Graduation Cap - Base Cap */}
            <path d="M9 10v1.5c0 1.66 1.34 3 3 3s3-1.34 3-3V10c-1 .5-2 .75-3 .75s-2-.25-3-.75z" />
            {/* Graduation Cap - Tassel */}
            <path d="M16.5 8.75v3.5c0 .28.22.5.5.5s.5-.22.5-.5v-3.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5z" />
            {/* Success Star */}
            <path d="M12 14.5l.6 1.2 1.3.2-.9.9.2 1.3-1.2-.6-1.2.6.2-1.3-.9-.9 1.3-.2.6-1.2z" />
        </svg>
    );
}
