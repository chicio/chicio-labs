import NextImage from "next/image";
import { CallToActionExternalWithTracking, ProjectCard } from "matrix-design-system";
import { everyLabProjectLink, openSourceProjects } from "@/lib/content/about-me/open-source-projects";
import { FC } from "react";

export const Projects: FC = () => (
    <div className="my-9 flex w-full flex-col gap-2 md:gap-3">
        {openSourceProjects().map(({ id, name, description, links, image }) => (
            <ProjectCard
                key={id}
                name={name}
                description={description}
                features={[]}
                callToActions={links.map(({ label, href }) => ({ label, link: href }))}
                image={image}
                imageComponent={NextImage}
            />
        ))}
        <div className="mt-4 flex justify-center">
            <CallToActionExternalWithTracking href={everyLabProjectLink.href} target="_blank" rel="noopener noreferrer">
                {everyLabProjectLink.label}
            </CallToActionExternalWithTracking>
        </div>
    </div>
);
