# Checklist (Task Item) Handling — v1 Specification & Test Cases

This document defines the behavior, schema, and interaction rules for checklist
(task item) support in a ProseMirror-based editor.

Checklist items represent actionable tasks with an explicit completion state
and are a first-class semantic node, not text-based markers.

---

## 1. Scope & Principles

- A checklist item is a list item with a boolean completion state.
- Checklist state is stored as structured data, not inferred from text.
- Checklist behavior must feel natural to non-technical users.
- Checklist items integrate cleanly with:
  - Auto-calculation
  - Undo / redo
  - Keyboard navigation
- No markdown-style `[x]` or `[ ]` parsing is used internally.

---

## 2. Data Model

### 2.1 Node Types

The checklist feature introduces two node types:

- `taskList`
- `taskItem`

### 2.2 taskItem Attributes

| Attribute | Type | Description |
|---------|------|-------------|
| `checked` | boolean | Whether the item is completed |

Default:
```
checked = false
```

---

### 2.3 Content Model

- `taskList` may only contain `taskItem`
- `taskItem` content:
  - One required paragraph
  - Optional nested lists (including taskList)

---

## 3. Creation & Conversion

### 3.1 Creating a Checklist

A checklist can be created by:
- Toolbar action: “Checklist”
- Command / shortcut
- Converting an existing bullet or numbered list

---

### 3.2 List Conversion Rules

When converting:
- Bullet → checklist
- Numbered → checklist

Behavior:
- Text content is preserved
- All items start as unchecked
- Order is preserved
- Undo restores the original list type

---

## 4. Interaction Behavior

### 4.1 Toggling Checked State

Checklist state can be toggled by:
- Clicking the checkbox
- Keyboard shortcut (implementation-defined)

Behavior:
- Toggle affects only the selected item
- Toggle is a single undoable action
- Cursor position is preserved

---

### 4.2 Editing Text

- Text inside a checklist item behaves like a normal paragraph
- Editing text does NOT affect checked state
- Checked items remain editable

---

### 4.3 Enter Key Behavior

When pressing `Enter` inside a checklist item:

| Cursor Position | Result |
|----------------|--------|
| Non-empty item | New unchecked checklist item below |
| Empty item | Exit checklist (convert to paragraph) |

---

### 4.4 Backspace Behavior

When pressing `Backspace` at the start of a checklist item:

| Condition | Result |
|---------|--------|
| Item has text | Normal character deletion |
| Item is empty | Convert to paragraph |
| First item in list | Convert to paragraph |

---

## 5. Nesting & Structure

- Checklist items may be nested
- Nested checklist items:
  - Are independent of parent state
  - Do NOT automatically toggle parent
- Parent-child completion logic is out of scope for v1

Example:
```
- [ ] Trip
  - [x] Book hotel
  - [ ] Buy tickets
```

---

## 6. Undo / Redo Semantics

- Toggling a checkbox is a single undo step
- Undo restores previous checked state
- Redo reapplies toggle
- Text edits and toggle actions remain independent

---

## 7. Integration with Auto-Calculation

- Only checklist items with `checked = true` are included in totals
- Unchecked items are excluded
- Numeric parsing applies to checklist item text content only
- Nested checklist totals are calculated independently

Example:
```
- [x] Balo 500k
- [ ] Tent 1.2m
```

Result:
- Checked total: `500k`
- Unchecked total: `1,200k`
- Displayed total: `500k`

---

## 8. UI Presentation

### 8.1 Checkbox UI

- Checkbox is visible at all times
- Checkbox reflects `checked` state
- Checkbox click does not steal text focus unnecessarily

---

### 8.2 Visual Styling

- Checked items MAY be visually muted (optional)
- Text remains readable and selectable
- Styling must not imply deletion or archival

---

## 9. Serialization & Persistence

- Checklist state MUST be preserved in the document model
- Serialization format is implementation-defined:
  - ProseMirror JSON
  - HTML with `data-checked`
- Markdown export (if any) is derived, not authoritative

---

## 10. Test Cases

### 10.1 Creation

| ID | Description | Expected |
|----|------------|----------|
| T1 | Create checklist | Items unchecked |
| T2 | Convert list | Text preserved |

---

### 10.2 Interaction

| ID | Description | Expected |
|----|------------|----------|
| T3 | Toggle checkbox | State updates |
| T4 | Undo toggle | State restored |
| T5 | Edit checked item | State unchanged |

---

### 10.3 Keyboard

| ID | Description | Expected |
|----|------------|----------|
| T6 | Enter in item | New unchecked item |
| T7 | Enter in empty | Exit checklist |
| T8 | Backspace empty | Convert to paragraph |

---

### 10.4 Calculation

| ID | Description | Expected |
|----|------------|----------|
| T9 | Checked only | Only checked counted |
| T10 | Nested list | Independent totals |

---

## 11. Non-Goals (Explicit)

- Parent task auto-completion
- Progress percentages
- Partial completion
- Due dates or reminders
- Drag-and-drop reordering
- Markdown-style `[x]` syntax as source of truth

---

End of specification.
