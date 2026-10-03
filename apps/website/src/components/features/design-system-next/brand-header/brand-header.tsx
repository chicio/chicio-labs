"use client";

import NextImage from "next/image";
import { FC } from "react";
import { BrandHeader as DesignSystemBrandHeader, type BrandHeaderProps } from "matrix-design-system";
import logoImage from "../../../../../public/media/logo.png";

export type BrandHeaderNextProps = Omit<BrandHeaderProps, "imageComponent" | "logo" | "title" | "tagline" | "logoAlt">;

const hostIdentity = { title: "CHICIO CODING", tagline: "Pixels. Code. Unplugged.", logoAlt: "blog logo" };

/**
 * BrandHeader bound to next/image, to this site's logo and to this site's Host Identity. The design
 * system ships no assets and no identity of its own, so both are injected here.
 */
export const BrandHeader: FC<BrandHeaderNextProps> = (props) => (
    <DesignSystemBrandHeader {...props} {...hostIdentity} logo={logoImage} imageComponent={NextImage} />
);
