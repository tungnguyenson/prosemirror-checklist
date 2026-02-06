import { Plugin } from "prosemirror-state";
import { Schema, NodeType } from "prosemirror-model";
import { inputRules } from "prosemirror-inputrules";
import { CheckItemView } from "./nodeview.js";
import { buildKeymap } from "./keymap.js";
import { buildInputRules } from "./inputrules.js";

export interface ChecklistOptions {
    /** 
     * Optional custom keymap. 
     * If not provided, default keys (Enter, Tab, Shift-Tab) will be used.
     */
    keymap?: boolean;
    /**
     * Optional input rules.
     * If enabled, - [ ] and - [x] will create checklists.
     */
    inputRules?: boolean;
}

/**
 * Create the checklist plugin
 */
export function checklist(options: ChecklistOptions = {}): Plugin[] {
    const { keymap: enableKeymap = true, inputRules: enableInputRules = true } = options;

    return [
        new Plugin({
            props: {
                nodeViews: {
                    checkItem(node, view, getPos) {
                        return new CheckItemView(node, view, getPos);
                    }
                }
            }
        })
    ];
}

/**
 * Utility to get all plugins including keymap and inputrules
 */
export function getChecklistPlugins(schema: Schema, options: ChecklistOptions = {}): Plugin[] {
    const plugins = checklist(options);
    const itemType = schema.nodes.checkItem;

    if (!itemType) {
        console.warn("Checklist schema nodes (checkList, checkItem) not found in schema.");
        return plugins;
    }

    if (options.keymap !== false) {
        plugins.push(buildKeymap(itemType));
    }

    if (options.inputRules !== false) {
        plugins.push(inputRules({ rules: buildInputRules(itemType) }));
    }

    return plugins;
}

export * from "./schema.js";
export * from "./commands.js";
export * from "./nodeview.js";
export * from "./keymap.js";
export * from "./inputrules.js";
