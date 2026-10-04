import { FC } from "react";
import { PlainImage, type ImageComponent, type ImageSource } from "../../atoms/effects/plain-image";
import { AnchorLink, type LinkComponent } from "../../atoms/links/anchor-link";
import { Tag } from "../buttons/tag";
import { TerminalButton } from "../buttons/terminal-button";

export interface CatalogCardLink {
    label: string;
    href: string;
}

export interface CatalogCardProps {
    name: string;
    /** What kind of project it is: shown as a Tag. */
    type: string;
    /** Where the type Tag leads: the section the card is in. */
    typeHref: string;
    /** The version of a project, the language or platform of another: shown beside the type. */
    meta?: string;
    description: string;
    /** The card image; absent: the card has no image and is only as tall as its content. */
    image?: ImageSource;
    /** The main action, a TerminalButton at the bottom. It opens in the same tab. */
    primary: CatalogCardLink;
    /** The other links, outward: each opens in a new tab. */
    links?: CatalogCardLink[];
    linkComponent?: LinkComponent;
    imageComponent?: ImageComponent;
}

const newTab = { target: "_blank", rel: "noopener noreferrer" };

export const CatalogCard: FC<CatalogCardProps> = ({
    name,
    type,
    typeHref,
    meta,
    description,
    image,
    primary,
    links = [],
    linkComponent,
    imageComponent: Image = PlainImage,
}) => {
    const Link = linkComponent ?? AnchorLink;

    return (
        <article
            className={`border-accent-alpha-25 hover:border-accent flex flex-col overflow-hidden rounded-[14px] border bg-[rgba(0,34,0,0.5)] transition-[border-color,box-shadow] duration-200 hover:shadow-[0_0_22px_rgba(57,255,20,0.3)]${image ? "" : "h-fit"}`}
        >
            {image && (
                <Link
                    href={primary.href}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="border-accent-alpha-25 relative block aspect-video overflow-hidden border-b bg-[#001a00]"
                >
                    <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(min-width: 992px) 360px, 100vw"
                        className="m-0 block h-full w-full object-cover"
                    />
                </Link>
            )}
            <div className="flex flex-1 flex-col gap-3 px-5 pt-[18px] pb-4">
                <h3 className="text-primary m-0 text-[22px] leading-[1.2] font-bold">{name}</h3>
                <div className="flex items-center gap-2.5">
                    <Tag tag={type} link={typeHref} big={false} linkComponent={linkComponent} />
                    {meta && <span className="text-secondary-text ml-auto font-mono text-[13px]">{meta}</span>}
                </div>
                <p className="m-0 line-clamp-3 text-[15px] leading-[1.55] opacity-85">{description}</p>
                {links.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
                        {links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-secondary-text decoration-accent-alpha-40 hover:text-primary font-mono text-sm underline underline-offset-[3px]"
                                {...newTab}
                            >
                                {link.label} ↗
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <TerminalButton
                className="mx-5 mt-auto mb-4"
                to={primary.href}
                label={primary.label}
                linkComponent={linkComponent}
            />
        </article>
    );
};
