import { FC } from "react";
import { CallToActionExternalWithTracking } from "../../../atoms/call-to-actions/call-to-action-external-with-tracking";
import { ImageGlow } from "../../../atoms/effects/image-glow";
import type { ImageComponent, ImageSource } from "../../../atoms/effects/plain-image";

export interface ProjectCardCallToAction {
    label: string;
    link: string;
    /** Opens the link in the same tab, for a link that stays on the host; every other link opens a new tab. */
    sameTab?: boolean;
}

export interface ProjectCardProps {
    name: string;
    description: string;
    features: string[];
    callToActions: ProjectCardCallToAction[];
    image: ImageSource;
    imageComponent?: ImageComponent;
}

export const ProjectCard: FC<ProjectCardProps> = ({
    name,
    description,
    features,
    callToActions,
    image,
    imageComponent,
}) => (
    <div className="mx-auto w-full">
        <div className="glow-container flex flex-col gap-5 p-4 md:mx-auto md:my-5 md:flex-row md:p-8">
            <div className="flex flex-1 flex-col">
                <h3 className="mb-3">{name}</h3>
                <p>{description}</p>
                <ul>
                    {features.map((feature) => (
                        <li key={`${name}${feature}`}>{feature}</li>
                    ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-4">
                    {callToActions.map((callToAction) => (
                        <CallToActionExternalWithTracking
                            key={callToAction.label}
                            href={callToAction.link}
                            target={callToAction.sameTab ? undefined : "_blank"}
                            rel={callToAction.sameTab ? undefined : "noopener noreferrer"}
                        >
                            {callToAction.label}
                        </CallToActionExternalWithTracking>
                    ))}
                </div>
            </div>
            <div className="relative mt-4 flex flex-1 items-center justify-center self-stretch overflow-hidden p-0 md:mt-0 md:p-7">
                <ImageGlow
                    imageComponent={imageComponent}
                    className="relative h-auto w-full max-w-[500px] object-cover md:h-[100%] md:w-auto md:max-w-full"
                    width={500}
                    height={500}
                    alt={name}
                    src={image}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: "500px",
                    }}
                />
            </div>
        </div>
    </div>
);
