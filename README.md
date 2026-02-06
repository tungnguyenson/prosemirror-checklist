# prosemirror-checklist

A ProseMirror module for adding interactive checkbox lists (checklists) to your editor.

## Features

- **Custom Nodes**: Provides `checkList` and `checkItem` schema definitions.
- **Interactive NodeView**: Clickable checkboxes directly in the editor.
- **Markdown Support**: (Requires custom serializer in server) Compatible with GFM task lists `- [ ]`.
- **Keyboard Shortcuts**:
    - `Enter`: Split item.
    - `Backspace`: Join with previous.
    - `Tab` / `Shift-Tab`: Indent / Outdent (Lift / Sink).
- **Smart Conversion**: `wrapInCheckList` command can interpret existing lists and convert them to checklists.

## Installation

```bash
npm install prosemirror-checklist
# or
pnpm add prosemirror-checklist
```

## Usage

### 1. Configure Schema

Add the nodes to your schema.

```typescript
import { checkList, checkItem } from "prosemirror-checklist";
import { Schema } from "prosemirror-model";

const mySchema = new Schema({
    nodes: {
        // ... other nodes
        checkList,
        checkItem,
        // ...
    },
    marks: { ... }
});
```

### 2. Add Plugins

Register the plugins (keymap, input rules, node view) in your editor state.

```typescript
import { getChecklistPlugins } from "prosemirror-checklist";

const state = EditorState.create({
    schema: mySchema,
    plugins: [
        ...getChecklistPlugins(mySchema),
        // ... other plugins
    ]
});
```

### 3. Menu Integration

To make the checklist usable, you should add a menu item using `prosemirror-menu` or a similar UI interaction.

```typescript
import { wrapInCheckList } from "prosemirror-checklist";
import { MenuItem } from "prosemirror-menu";

const checklistItem = new MenuItem({
    title: "Insert Checklist",
    label: "Checklist",
    icon: { text: "☑️", css: "font-size: 16px; vertical-align: middle;" },
    enable: () => true,
    run: (state, dispatch, view) => {
        const { checkList } = mySchema.nodes;
        return wrapInCheckList(checkList)(state, dispatch, view);
    }
});
```

## Attribution

This package is built on top of [ProseMirror](https://github.com/prosemirror), a robust toolkit for building rich-text editors on the web.
