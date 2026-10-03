/**
 * What caused a palette to open or close. Consumers need this to tell a deliberate open (the trigger
 * button dispatching the open event) apart from an incidental one (the keyboard shortcut).
 */
export type CommandPaletteChangeCause = "shortcut" | "event" | "escape" | "dismiss";
