/**
 * The public surface of the Matrix design system.
 *
 * Components are exported from one root barrel: a consumer writes
 * `import { Button, Accordion, Menu } from "matrix-design-system"` and never has to know
 * whether something is an atom, a molecule or an organism — a classification that can then
 * change without breaking anyone.
 *
 * The exceptions are the three groups that need optional peer dependencies — charts (recharts),
 * markdown (the unified/remark/rehype stack) and the command palette (cmdk). They live behind
 * `matrix-design-system/chart`, `/markdown` and `/command-palette` so that everything here
 * resolves with nothing but the required peers installed. Anything reachable from this file must
 * stay that way: adding an optional-peer component here silently breaks every consumer that did
 * not install it.
 *
 * Generated from the component barrels; keep it sorted and complete.
 */

// components
export * from "./atoms/animation/motion-div";
export * from "./atoms/buttons/button";
export * from "./atoms/buttons/switch";
export * from "./atoms/call-to-actions/call-to-action-external-with-tracking";
export * from "./atoms/call-to-actions/call-to-action-internal-with-tracking";
export * from "./atoms/chip";
export * from "./atoms/effects/glassmorphism-background";
export * from "./atoms/effects/image-glow";
export * from "./atoms/effects/image-shimmer-placeholder";
export * from "./atoms/effects/matrix-rain/matrix-rain";
export * from "./atoms/effects/overlay";
export * from "./atoms/effects/pills";
export * from "./atoms/effects/plain-image";
export * from "./atoms/icons/chat-icon";
export * from "./atoms/icons/copy-icon";
export * from "./atoms/icons/rounded-icon";
export * from "./atoms/links/anchor-link";
export * from "./atoms/links/external-link";
export * from "./atoms/links/internal-link";
export * from "./atoms/loader/loader";
export * from "./atoms/typography/input-field";
export * from "./atoms/typography/label";
export * from "./atoms/typography/terminal-blocks";
export * from "./atoms/typography/textarea";
export * from "./molecules/accordion/accordion";
export * from "./molecules/breadcrumbs/breadcrumb";
export * from "./molecules/buttons/pagination-navigation";
export * from "./molecules/buttons/pills-buttons";
export * from "./molecules/buttons/segmented-control";
export * from "./molecules/buttons/social-contact";
export * from "./molecules/buttons/tag";
export * from "./molecules/buttons/terminal-button";
export * from "./molecules/catalog-card";
export * from "./molecules/containers/content-container";
export * from "./molecules/controls/control-slider";
export * from "./molecules/cover-card/cover-card";
export * from "./molecules/cover-card/cover-card-badge";
export * from "./molecules/effects/matrix-background";
export * from "./molecules/effects/matrix-header-background";
export * from "./molecules/effects/matrix-terminal";
export * from "./molecules/empty-state";
export * from "./molecules/form/filter-input";
export * from "./molecules/form/form-error-summary";
export * from "./molecules/form/form-field";
export * from "./molecules/form/form-success-message";
export * from "./molecules/form/form-textarea";
export * from "./molecules/info-pill";
export * from "./molecules/lightbox-image";
export * from "./molecules/links/pills-links";
export * from "./molecules/menu/close";
export * from "./molecules/menu/dropdown-menu";
export * from "./molecules/menu/hamburger-menu";
export * from "./molecules/menu/menu-item";
export * from "./molecules/previous-next-navigation";
export * from "./molecules/project-card/project-card";
export * from "./molecules/stat-card";
export * from "./molecules/terminal-list-item";
export * from "./molecules/terminal-progress-bar";
export * from "./molecules/typography/page-title";
export * from "./molecules/typography/paragraph-title-with-icon";
export * from "./molecules/typography/section-heading";
export * from "./molecules/video/self-hosted-video";
export * from "./molecules/video/youtube";
export * from "./organism/cookie-consent-banner";
export * from "./organism/footer";
export * from "./organism/header/brand-header";
export * from "./organism/image-carousel";
export * from "./organism/lightbox";
export * from "./organism/loading-bar";
export * from "./organism/menu";
export * from "./organism/profile-hero";
export * from "./organism/profile-photo";
export * from "./organism/reading-content-progress-bar";
export * from "./organism/social-contacts";

// shared hooks
export * from "./hooks/use-clipboard-available";
export * from "./hooks/use-device-capabilities";
export * from "./hooks/use-glassmorphism";
export * from "./hooks/use-in-view";
export * from "./hooks/use-in-view-list";
export * from "./hooks/use-is-ios";
export * from "./hooks/use-lock-body-scroll";
export * from "./hooks/use-matrix-settings-store";
export * from "./hooks/use-motion-store";
export * from "./hooks/use-os-modifier-key";
export * from "./hooks/use-reading-progress";
export * from "./hooks/use-reduced-motions";
export * from "./hooks/use-scroll-direction";
export * from "./hooks/use-webgpu-supported";
export * from "./hooks/use-typewriter";

// cross-component state and contracts
export * from "./state/command-palette/command-palette-context";
export * from "./state/command-palette/command-palette-events";
export * from "./state/command-palette/command-palette-change-cause";
export * from "./state/lightbox/lightbox-events";
export * from "./state/matrix-rain/matrix-settings";
export * from "./state/motion/motion";
