import { CallToActionExternalWithTracking } from "matrix-design-system";
import { CatalogCard } from "@/components/features/design-system-next/catalog-card";
import { everyLabProjectLink, openSourceSection } from "@/lib/content/about-me/open-source-section";
import { FC } from "react";

export const Projects: FC = () => (
    <div className="my-9 flex w-full flex-col gap-8">
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
            {openSourceSection().map(({ id, ...card }) => (
                <CatalogCard key={id} {...card} />
            ))}
        </div>
        <div className="flex justify-center">
            <CallToActionExternalWithTracking href={everyLabProjectLink.href} target="_blank" rel="noopener noreferrer">
                {everyLabProjectLink.label}
            </CallToActionExternalWithTracking>
        </div>
    </div>
);
