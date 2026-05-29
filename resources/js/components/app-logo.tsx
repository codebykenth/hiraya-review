import AppLogoIcon from '@/components/app-logo-icon';
import BrandName from '@/components/brand-name';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-14 items-center justify-center overflow-hidden rounded-md bg-transparent">
                <AppLogoIcon className="size-14 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-xl">
                <span className="truncate leading-tight font-semibold">
                    <BrandName />
                </span>
            </div>
        </>
    );
}
