import { keymap } from "prosemirror-keymap";
import { splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list";
import type { Command, EditorState, Transaction } from "prosemirror-state";
import { NodeType } from "prosemirror-model";
import { toggleChecked } from "./commands.js";

export function buildKeymap(itemType: NodeType) {
    const keys: Record<string, Command> = {
        "Enter": checkItemEnter(itemType),
        "Tab": sinkListItem(itemType),
        "Shift-Tab": liftListItem(itemType),
        "Mod-Shift-Enter": toggleChecked
    };

    return keymap(keys);
}

export function checkItemEnter(itemType: NodeType): Command {
    return (state, dispatch) => {
        const { $from, $to } = state.selection;
        if (!$from.sameParent($to) || $from.parent.type.name !== 'paragraph') return false;

        const listItem = $from.node(-1);
        if (listItem.type !== itemType) return false;

        // If at the end of an empty item, lift it
        if ($from.parent.content.size === 0 && listItem.childCount === 1) {
            return liftListItem(itemType)(state, dispatch);
        }

        // Split list item, ensuring new item is unchecked
        return splitListItem(itemType, { checked: false })(state, dispatch);
    };
}
