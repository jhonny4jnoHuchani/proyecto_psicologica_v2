import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Fragment } from 'react';

export function Breadcrumbs({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
        <Breadcrumb className="overflow-hidden max-w-full">
            <BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden text-xs sm:text-sm">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const isFirst = index === 0;
                    return (
                        <Fragment key={index}>
                            <BreadcrumbItem className={!isLast && !isFirst && breadcrumbs.length > 2 ? 'hidden sm:inline-flex' : ''}>
                                {isLast ? (
                                    <BreadcrumbPage className="max-w-[130px] sm:max-w-[260px] truncate">{item.title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={item.href} className="max-w-[90px] sm:max-w-[160px] truncate">{item.title}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className={!isLast && !isFirst && breadcrumbs.length > 2 ? 'hidden sm:inline-flex' : ''} />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
