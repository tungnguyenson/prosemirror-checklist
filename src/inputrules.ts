import { InputRule, wrappingInputRule } from "prosemirror-inputrules";
import { NodeType } from "prosemirror-model";

/**
 * Handle input rules for checklists
 * - [ ] -> unchecked taskList
 * - [x] -> checked taskList
 */
export function buildInputRules(itemType: NodeType): InputRule[] {
    return [
        wrappingInputRule(
            /^\[\s\]\s$/,
            itemType,
            () => ({ checked: false })
        ),
        wrappingInputRule(
            /^\[x\]\s$/i,
            itemType,
            () => ({ checked: true })
        )
    ];
}
