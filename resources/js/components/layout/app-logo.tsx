import AppLogoIcon from '@/components/layout/app-logo-icon';
import BrandName from '@/components/shared/brand-name';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md bg-transparent group-data-[collapsible=icon]:!size-8 md:size-14">
                <AppLogoIcon className="size-10 object-contain group-data-[collapsible=icon]:!size-8 md:size-14" />
            </div>
            <div className="grid flex-1 text-left text-lg group-data-[collapsible=icon]:hidden md:text-xl">
                <span className="leading-tight font-semibold whitespace-nowrap">
                    <BrandName />
                </span>
            </div>
        </>
    );
}
