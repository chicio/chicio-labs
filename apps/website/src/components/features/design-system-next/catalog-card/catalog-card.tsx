"use client";

import NextImage from "next/image";
import { FC } from "react";
import { CatalogCard as DesignSystemCatalogCard, type CatalogCardProps } from "matrix-design-system";
import { NextLink } from "@/components/features/design-system-next/next-link";

export type { CatalogCardProps };

/** CatalogCard bound to next/image and next/link. See design-system-next/image-glow for why this layer exists. */
export const CatalogCard: FC<Omit<CatalogCardProps, "imageComponent" | "linkComponent">> = (props) => (
    <DesignSystemCatalogCard {...props} imageComponent={NextImage} linkComponent={NextLink} />
);
