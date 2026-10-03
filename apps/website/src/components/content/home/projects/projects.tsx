import NextImage from "next/image";
import { ProjectCard } from "matrix-design-system";
import { projects } from "@/content/home/projects";
import { FC } from "react";

export const Projects: FC = () => (
    <div className="my-9 flex w-full flex-col gap-2 md:gap-3">
        {Object.keys(projects).map((projectKey) => {
            const { name, description, features, callToActions, image } = projects[projectKey];

            return (
                <ProjectCard
                    key={name}
                    name={name}
                    description={description}
                    features={features}
                    callToActions={callToActions}
                    image={image}
                    imageComponent={NextImage}
                />
            );
        })}
    </div>
);
