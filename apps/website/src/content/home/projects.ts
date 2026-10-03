import { labs } from "../../types/configuration/labs";
import { tracking } from "../../types/configuration/tracking";

interface ProjectCallToAction {
  label: string;
  link: string;
  trackingAction: string;
  trackingCategory: string;
  trackingLabel: string;
}

export interface Project {
  name: string;
  abstract: string;
  description: string;
  callToActions: ProjectCallToAction[];
  features: string[];
  image: string;
}

export const projects: Record<string, Project> = {
  "react-native-skia-skeleton": {
    name: "React Native Skia Skeleton",
    abstract:
      "A high-performance skeleton loader component for React Native, built with React Native Skia and" +
      " React Native Reanimated.",
    description:
      "Yet another React Native skeleton component, built with React Native Skia and React Native" +
      " Reanimated. It renders elegant loading placeholders with customizable shapes, shimmer" +
      " animations, theme support, and right-to-left layouts, with zero dependencies beyond Skia and" +
      " Reanimated. Works on Android, iOS, and Web.",
    features: [
      "Mobile / React Native",
      "React Native Skia",
      "React Native Reanimated",
      "Shimmer skeleton placeholders",
      "RTL & theme support",
      "TypeScript",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_react_native_skia_skeleton_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/react-native-skia-skeleton",
      },
    ],
    image: '/media/content/about-me/projects/react-native-skia-skeleton.png',
  },
  "matrix-rain-webgpu": {
    name: "Matrix Rain WebGPU",
    abstract:
      "GPU-accelerated Matrix-style digital rain effect for React, built with WebGPU and TypeGPU." +
      " It powers the animated background of this site.",
    description:
      "A GPU-accelerated Matrix-style digital rain effect built with WebGPU and TypeGPU, shipped as a" +
      " customizable React component. It combines GPU-driven simulation, signed-distance-field glyphs," +
      " depth parallax, bloom, and a CRT post-process. It powers the animated Matrix rain background of" +
      " this site, with a 2D canvas fallback when WebGPU is unavailable.",
    features: [
      "Computer graphics",
      "WebGPU",
      "TypeGPU",
      "GPU-driven simulation",
      "SDF glyphs, bloom & CRT post-process",
      "React, TypeScript",
    ],
    callToActions: [
      {
        label: "Demo",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_matrix_rain_webgpu_demo,
        trackingLabel: tracking.label.body,
        link: labs.matrixRainUrl,
      },
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_matrix_rain_webgpu_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/chicio-labs",
      },
    ],
    image: '/media/content/about-me/projects/matrix-rain-webgpu.png',
  },
  "spectral-clara-lux-tracer": {
    name: "Spectral Clara Lux Tracer",
    abstract:
      "Physically based ray tracer with multiple shading models support and Color Rendering Index (CRI)" +
      " evaluation.",
    description:
      "Physically based ray tracer with multiple shading models support and CRI" +
      " evaluation. Project developed for my master degree thesis at University Milano-Bicocca - Imaging and Vision" +
      " Laboratory.",
    features: [
      "Computer graphics",
      "Ray-tracing",
      "Physically based rendering",
      "Color Rendering index calculation",
      "iOS, macOS, Windows",
      "C++"
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_sclt_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/Spectral-Clara-Lux-Tracer",
      },
      {
        label: "Thesis",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_sclt_thesis,
        trackingLabel: tracking.label.body,
        link: "https://www.fabrizioduroni.it/tesi-fabrizio-duroni-770157.pdf",
      },
    ],
    image: '/media/content/about-me/projects/spectral-clara-lux-tracer.jpg'
  },
  "spectral-brdf-explorer": {
    name: "Spectral BRDF Explorer",
    abstract: "An iOS OpenGL ES app for exploring lighting models.",
    description:
      "An iOS OpenGL ES application inspired by Walt Animation Disney Studios BRDF Viewer. It" +
      " shows some of the most famous lighting model used in computer graphics and that supports color calculation using RGB and spectral data of lights and object surfaces.",
    features: [
      "Computer graphics",
      "OpenGL ES",
      "Color calculation using spectral data",
      "iOS, Android",
      "Objective-C, Java, C++",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_spectral_brdf_explorer_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/Spectral-BRDF-Explorer",
      },
    ],
    image: '/media/content/about-me/projects/spectral-brdf-explorer.png'

  },
  id3tageditor: {
    name: "ID3TagEditor",
    abstract: "A Swift library to edit ID3 Tag of any mp3 file. ",
    description:
      "A Swift library to read and modify ID3 Tag of any mp3 file. Supported " +
      "ID3 tag version: 2.2. and 2.3. Listed in the implementations section " +
      "of the official ID3 standard website id3.org. It supports the following operating systems: iOS, macOS, tvOS, watchOS, Linux.",
    features: [
      "Multiple id3 tag version supported",
      "Strictly adhere to the offical standard",
      "No external dependencies",
      "Swift SPM and cocoapods support",
      "100% Swift",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_id3tageditor_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/ID3TagEditor",
      },
      {
        label: "Docs",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_id3tageditor_doc,
        trackingLabel: tracking.label.body,
        link: "https://chicio.github.io/ID3TagEditor/documentation/id3tageditor/",
      },
    ],
    image: '/media/content/about-me/projects/id3tageditor.jpg'
  },
  "range-ui-slider": {
    name: "RangeUISlider",
    abstract: "A RangeUISlider component for iOS and iPadOS.",
    description:
      "A highly customizable iOS range selection slider, developed using " +
      "autolayout and completely customizable using IBDesignabled and " +
      "IBInspectable. Compatible with SwiftUI.",
    features: [
      "Cocoa Touch",
      "SwiftUI",
      "Autolayout",
      "IBDesignable + IBInspectable",
      "iOS",
      "Swift",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_rangeuislider_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/RangeUISlider",
      },
      {
        label: "Docs",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_rangeuislider_doc,
        trackingLabel: tracking.label.body,
        link: "https://chicio.github.io/RangeUISlider/",
      },
    ],
    image: '/media/content/about-me/projects/range-ui-slider.png'
  },
  tabbaruiaction: {
    name: "TabBarUIAction",
    abstract: "A SwiftUI custom TabBar for iOS and macOS.",
    description:
      "A SwiftUI custom TabBar view with action button for modal content " +
      "display. Fully compatible with Mac Catalyst. Available as a standalone " +
      "framework, a SwiftPM package and as a Cocoapods pod.",
    features: [
      "customizable tab item",
      "custom central tab item action to show modal screens",
      "supported platform: iOS, iPadOS and macOS",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_tabbaruiaction_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/TabBarUIAction",
      },
      {
        label: "Docs",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_tabbaruiaction_doc,
        trackingLabel: tracking.label.body,
        link: "https://chicio.github.io/TabBarUIAction/",
      },
    ],
    image: '/media/content/about-me/projects/tabbaruiaction.png'
  },
  mp3id3tagger: {
    name: "Mp3ID3Tagger",
    abstract: "A macOS application to edit the ID3 tag of your mp3 files.",
    description:
      "A macOS application to edit the ID3 tag of your mp3 files. " +
      "Mp3ID3Tagger supports the following ID3 tag versions: 2.2. and 2.3. It " +
      "will let you modify the information inside the ID3 tag of " +
      "you mp3 files.",
    features: [
      "100% macOS native app",
      "Implemented using Reactive programming (RxCocoa)",
    ],
    callToActions: [
      {
        label: "Github",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_mp3id3tagger_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/Mp3ID3Tagger",
      },
      {
        label: "Download",
        trackingCategory: tracking.category.home,
        trackingAction: tracking.action.open_mp3id3tagger_github,
        trackingLabel: tracking.label.body,
        link: "https://github.com/chicio/Mp3ID3Tagger/raw/master/Release/Mp3ID3Tagger.dmg",
      },
    ],
    image: '/media/content/about-me/projects/mp3id3tagger.jpg'
  },
};
