import type { NodeSpec } from "prosemirror-model";

export const checkList: NodeSpec = {
    group: "block",
    content: "checkItem+",
    parseDOM: [{ tag: 'ul[data-check-list]' }],
    toDOM: () => ['ul', { 'data-check-list': '', class: 'prosemirror-checklist' }, 0]
};

export const checkItem: NodeSpec = {
    attrs: {
        checked: { default: false }
    },
    content: "paragraph block*",
    defining: true,
    parseDOM: [{
        tag: 'li[data-check-item]',
        getAttrs: dom => {
            const checked = (dom as HTMLElement).getAttribute('data-checked');
            return { checked: checked === 'true' };
        }
    }],
    toDOM: node => ['li', {
        'data-check-item': '',
        'data-checked': node.attrs.checked ? 'true' : 'false',
        class: 'prosemirror-check-item'
    }, 0]
};
