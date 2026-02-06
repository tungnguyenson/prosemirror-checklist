import { Node as ProseMirrorNode } from "prosemirror-model";
import { EditorView, type NodeView } from "prosemirror-view";

export class CheckItemView implements NodeView {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    checkbox: HTMLInputElement;

    constructor(
        public node: ProseMirrorNode,
        public view: EditorView,
        public getPos: () => number | undefined
    ) {
        this.dom = document.createElement("li");
        this.dom.setAttribute("data-check-item", "");
        this.dom.setAttribute("data-checked", node.attrs.checked ? "true" : "false");

        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.className = "check-checkbox";
        this.checkbox.checked = node.attrs.checked;
        this.checkbox.addEventListener("change", (e) => {
            const pos = this.getPos();
            if (pos !== undefined) {
                const { tr } = this.view.state;
                tr.setNodeMarkup(pos, undefined, {
                    ...this.node.attrs,
                    checked: (e.target as HTMLInputElement).checked
                });
                this.view.dispatch(tr);
            }
        });

        // Prevent click from stealing focus or moving selection
        this.checkbox.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });

        this.dom.appendChild(this.checkbox);

        const contentContainer = document.createElement("div");
        contentContainer.className = "check-content";
        this.dom.appendChild(contentContainer);
        this.contentDOM = contentContainer;
    }

    update(node: ProseMirrorNode) {
        if (node.type !== this.node.type) return false;
        this.node = node;
        this.checkbox.checked = node.attrs.checked;
        this.dom.setAttribute("data-checked", node.attrs.checked ? "true" : "false");
        return true;
    }

    ignoreMutation(mutation: any) {
        return mutation.type === "attributes" && mutation.target === this.checkbox;
    }

    stopEvent(event: Event) {
        return event.target === this.checkbox;
    }
}
