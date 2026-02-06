import type { Command, EditorState, Transaction } from "prosemirror-state";
import { NodeRange, NodeType } from "prosemirror-model";
import { lift, wrapIn } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";

/**
 * Toggle the checked attribute of the check item at the current selection
 */
export const toggleChecked: Command = (state, dispatch) => {
    const { $from, $to } = state.selection;
    const checkItemType = state.schema.nodes.checkItem;
    if (!checkItemType) return false;

    let found = false;
    state.doc.nodesBetween($from.before(), $to.after(), (node, pos) => {
        if (node.type === checkItemType) {
            if (dispatch) {
                dispatch(state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    checked: !node.attrs.checked
                }));
            }
            found = true;
            return false;
        }
    });

    return found;
};

/**
 * Update checked attribute for a specific check item
 */
export function setChecked(pos: number, checked: boolean): Command {
    return (state, dispatch) => {
        const node = state.doc.nodeAt(pos);
        if (node && node.type.name === 'checkItem') {
            if (dispatch) {
                dispatch(state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    checked
                }));
            }
            return true;
        }
        return false;
    };
}

/**
 * Wrap the selection in a check list
 */
export function wrapInCheckList(type: NodeType): Command {
    return (state, dispatch) => {
        const { $from, $to } = state.selection;
        // Check if we are inside a list item
        const range = $from.blockRange($to, node => node.childCount > 0 && node.firstChild?.type.name === 'list_item');

        if (!range) {
            // Not appearing to be a list transformation, try default wrap
            return wrapInList(type)(state, dispatch);
        }

        const listNode = range.parent;
        // Verify it is a compatible list (bullet or ordered)
        // We assume any list with list_item children is a candidate for conversion
        if (listNode.type.name !== 'bullet_list' && listNode.type.name !== 'ordered_list') {
            return wrapInList(type)(state, dispatch);
        }

        const checkItemType = state.schema.nodes.checkItem;
        if (!checkItemType) return false;

        if (dispatch) {
            const tr = state.tr;
            // 1. Change parent type to checkList
            // We can't just setNodeMarkup content must be valid.
            // But since we are changing children too, we might need to be careful.
            // However, ProseMirror validation happens at the end of the step? 
            // Actually, setNodeMarkup might check immediate validity.

            // Strategy: Create a new Fragment of checkItems and replace the range.

            const checkItems: ProseMirrorNode[] = [];
            // Iterate over the list items in the range
            // Note: The range might be the whole list or part of it?
            // blockRange on list_item children -> parent is the list.

            // We want to convert the *whole* list? 
            // The command is "Insert Checklist". If I am in a list, likely I want to convert the list.
            // Let's assume we convert the whole wrapping list for now, or just the selected items?
            // If we convert just selected items, we have to split the list.

            // Let's try to just use setNodeMarkup on the parent if it works, assuming checkItem and list_item are similar content-wise?
            // No, checkList expects checkItem.

            // Safer: Recreate the structure.
            const start = range.start;
            const end = range.end;

            // We will map over the content in the range
            // range.startIndex and range.endIndex give us the index of children in parent

            const items: ProseMirrorNode[] = [];
            listNode.content.forEach((node, offset, index) => {
                if (index >= range.startIndex && index < range.endIndex) {
                    // This is one of the selected items
                    if (node.type.name === 'list_item') {
                        items.push(checkItemType.createAndFill({ checked: false }, node.content) as ProseMirrorNode);
                    } else {
                        // Keep as is? Or ignore?
                        items.push(node);
                    }
                }
            });

            // If we are replacing the *entire* content of the list, we can just transform the list node?
            // If range covers all children:
            if (range.startIndex === 0 && range.endIndex === listNode.childCount) {
                // Replace the whole list node with a checkList node containing checkItems
                const newCheckList = type.create(null, items);
                tr.replaceRangeWith(range.start - 1, range.end + 1, newCheckList);
                dispatch(tr);
                return true;
            }

            // If partial selection, we technically should split the list.
            // But wrapInList normally wraps selection. 
            // If we use wrapInList behavior usually it wraps nodes.

            // Let's fallback to replacing the subset. 
            // But checkList must be a block. modifying a subset of a bullet_list to checkList means we have:
            // bullet_list
            //   list_item
            //   checkList (nested? valid?) or we break the list.
            //   list_item

            // standard wrapInList logic is complex. 
            // Let's simplify: If inside a list, convert the WHOLE list node to checklist.
            // This is usually what users expect when clicking "Checklist" inside a bullet list.

            // Redo logic to grab the whole list if we are inside one.
            const parentList = $from.node(range.depth);
            if (parentList && (parentList.type.name === 'bullet_list' || parentList.type.name === 'ordered_list')) {
                const checkItemsAll: ProseMirrorNode[] = [];
                parentList.content.forEach(node => {
                    if (node.type.name === 'list_item') {
                        checkItemsAll.push(checkItemType.createAndFill({ checked: false }, node.content) as ProseMirrorNode);
                    }
                });
                const listPos = $from.before(range.depth);
                tr.replaceWith(listPos, listPos + parentList.nodeSize, type.create(null, checkItemsAll));
                dispatch(tr);
                return true;
            }
        }

        return wrapInList(type)(state, dispatch);
    };
}

import { Node as ProseMirrorNode } from "prosemirror-model";
