import type { PricingPlan } from '@/pages/user/billing/types';

export interface AdminPaymentUser {
    id: number;
    name: string;
    email: string;
    is_premium: boolean;
}

export interface AdminPaymentItem {
    id: number;
    reference_id: string;
    xendit_id: string | null;
    status: 'paid' | 'pending' | 'failed' | 'expired';
    amount: number;
    fee_amount: number;
    vat_amount: number;
    net_amount: number;
    currency: string;
    plan_code: string;
    plan_name: string;
    payment_method: string | null;
    checkout_url: string | null;
    paid_at: string | null;
    created_at: string | null;
    user?: AdminPaymentUser;
    metadata: Record<string, unknown>;
}

export interface PaymentStats {
    total_revenue: number;
    total_net_revenue: number;
    total_fees: number;
    total_vat: number;
    total_deductions: number;
    real_balance: number | null;
    paid_count: number;
    pending_count: number;
    unique_customers: number;
}

export interface PaymentFilters {
    search: string;
    status: string;
    plan: string;
}

export interface AdminPaymentsPageProps {
    payments: {
        data: AdminPaymentItem[];
        meta?: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    stats: PaymentStats;
    filters: PaymentFilters;
    plans: PricingPlan[];
}
