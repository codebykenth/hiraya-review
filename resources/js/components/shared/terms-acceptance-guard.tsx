import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AcceptTermsModal from './accept-terms-modal';

type Props = {
    children: ReactNode;
};

export default function TermsAcceptanceGuard({ children }: Props) {
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const showTermsModal = auth?.user && !auth.user.terms_accepted_at;

    return (
        <>
            {showTermsModal && <AcceptTermsModal isOpen={showTermsModal} />}
            {children}
        </>
    );
}
