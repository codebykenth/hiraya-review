export interface PricingPlan {
    name: string;
    code: string;
    price: number;
    currency: string;
    billing_period: string;
    duration_days: number | null;
    description: string;
    features: string[];
    badge?: string;
    is_featured?: boolean;
}

export interface PaymentItem {
    id: number;
    reference_id: string;
    status: 'pending' | 'paid' | 'failed' | 'expired';
    amount: number;
    currency: string;
    plan_code: string;
    plan_name: string;
    payment_method: string | null;
    checkout_url: string | null;
    paid_at: string | null;
    created_at: string | null;
}

export interface UserSubscriptionStatus {
    is_premium: boolean;
    premium_until: string | null;
}

export interface SandboxConfig {
    is_active: boolean;
    is_configured: boolean;
}

export interface BillingPageProps {
    plans: PricingPlan[];
    subscription: UserSubscriptionStatus;
    recent_payments: {
        data: PaymentItem[];
    };
    sandbox: SandboxConfig;
}
