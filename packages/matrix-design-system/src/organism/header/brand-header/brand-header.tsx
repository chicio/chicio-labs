"use client";

import { MatrixHeaderBackground } from "../../../molecules/effects/matrix-header-background";
import { FC, PropsWithChildren } from "react";
import { ImageGlow } from "../../../atoms/effects/image-glow";
import type { ImageComponent, ImageSource } from "../../../atoms/effects/plain-image";
import { Cursor } from "../../../atoms/typography/terminal-blocks";
import { useGlassmorphism } from "../../../hooks/use-glassmorphism";

const Passthrough: FC<PropsWithChildren> = ({ children }) => <>{children}</>;

export interface BrandHeaderProps {
    big: boolean;
    /** The Host Identity: required and never defaulted, so a host cannot inherit another site's name. */
    title: string;
    tagline: string;
    logoAlt: string;
    wrapper?: FC<PropsWithChildren>;
    /** Injected by the consumer: the design system ships no site assets of its own. */
    logo: ImageSource;
    imageComponent?: ImageComponent;
}

export const BrandHeader: FC<BrandHeaderProps> = ({
    big,
    title,
    tagline,
    logoAlt,
    wrapper: Wrapper = Passthrough,
    logo,
    imageComponent,
}) => {
    const { glassmorphismClass } = useGlassmorphism({ noScale: true });
    const height = big ? "h-auto" : "h-[170px] md:h-[200px]";
    const margins = big ? "mt-14 mb-8" : "mt-12";

    return (
        <div className={`block ${height}`}>
            <MatrixHeaderBackground big={big} />
            <Wrapper>
                <div className={`flex items-center ${margins}`}>
                    <div className={`${glassmorphismClass} z-30 w-full p-5 md:p-9`}>
                        <div className="flex w-full items-center">
                            <ImageGlow
                                imageComponent={imageComponent}
                                src={logo}
                                alt={logoAlt}
                                width={80}
                                height={80}
                                placeholder={"blur"}
                                className="mr-3 h-[50px] w-[50px] object-cover sm:h-[80px] sm:w-[80px]"
                            />
                            <div className="flex flex-col justify-start">
                                <span className="text-accent m-0 block font-mono text-2xl font-bold uppercase text-shadow-lg sm:text-4xl">
                                    <span className="text-shadow-md">{">"} </span>
                                    {title}
                                    <Cursor />
                                </span>
                                <span className="text-primary-text font-mono text-xs font-normal text-shadow-md sm:text-lg">
                                    {tagline}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </div>
    );
};
