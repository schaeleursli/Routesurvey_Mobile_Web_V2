<template>
  <div class="minimal-editor">
    <div class="editor-toolbar d-flex gap-2 p-2 border-bottom bg-light" role="toolbar" aria-label="Text formatting">
      <!-- Headers -->
      <div class="btn-group btn-group-sm" role="group" aria-label="Headings">
        <button class="btn btn-outline-secondary" @click="insertSyntax('## ')" title="Heading 2" aria-label="Insert heading 2">H2</button>
        <button class="btn btn-outline-secondary" @click="insertSyntax('### ')" title="Heading 3" aria-label="Insert heading 3">H3</button>
      </div>

      <!-- Emphasis -->
      <button class="btn btn-sm btn-outline-secondary" @click="insertBounds('**', '**')" title="Bold" aria-label="Bold text">
        <PhTextBolder :size="16" aria-hidden="true" />
      </button>

      <!-- Lists -->
      <div class="btn-group btn-group-sm" role="group" aria-label="Lists">
        <button class="btn btn-outline-secondary" @click="insertSyntax('- ')" title="Bullet List" aria-label="Insert bullet list">
          <PhList :size="16" aria-hidden="true" />
        </button>
        <button class="btn btn-outline-secondary" @click="insertSyntax('1. ')" title="Numbered List" aria-label="Insert numbered list">
          <PhListNumbers :size="16" aria-hidden="true" />
        </button>
      </div>

      <!-- Insertions -->
      <div class="btn-group btn-group-sm" role="group" aria-label="Insert elements">
        <button class="btn btn-outline-secondary" @click="insertTable" title="Insert Table" aria-label="Insert table">
          <PhTable :size="16" aria-hidden="true" />
        </button>
        <button class="btn btn-outline-secondary" @click="insertImage" title="Insert Image" aria-label="Insert image">
          <PhImage :size="16" aria-hidden="true" />
        </button>
        <button class="btn btn-outline-secondary" @click="insertLink" title="Insert Link" aria-label="Insert link">
          <PhLink :size="16" aria-hidden="true" />
        </button>
      </div>
    </div>

    <textarea
      ref="textareaRef"
      class="form-control border-0 rounded-0"
      :value="modelValue"
      @input="updateValue"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      :placeholder="placeholder"
      rows="10"
      style="min-height: 200px; resize: vertical;"
      aria-label="Section content editor"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PhTextBolder, PhList, PhListNumbers, PhTable, PhImage, PhLink } from '@phosphor-icons/vue';

const props = defineProps<{
  modelValue: string,
  placeholder?: string
}>();

const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const updateValue = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

// Helper helpers
const insertAtCursor = (text: string) => {
  const el = textareaRef.value;
  if (!el) return;
  
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;
  
  const newVal = val.substring(0, start) + text + val.substring(end);
  emit('update:modelValue', newVal);
  
  // Restore cursor? Next tick.
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = start + text.length;
    el.focus();
  }, 0);
};

const insertBounds = (prefix: string, suffix: string) => {
  const el = textareaRef.value;
  if (!el) return;
  
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;
  const selection = val.substring(start, end);
  
  const newVal = val.substring(0, start) + prefix + selection + suffix + val.substring(end);
  emit('update:modelValue', newVal);
  
  setTimeout(() => {
    el.selectionStart = start + prefix.length;
    el.selectionEnd = end + prefix.length;
    el.focus();
  }, 0);
};

const insertSyntax = (syntax: string) => {
    insertAtCursor(syntax);
};

const insertTable = () => {
    const tableTemplate = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
    insertAtCursor(tableTemplate);
};

const insertImage = () => {
    // Logic to open media library? Or just markdown syntax for now
    insertAtCursor('![Caption](Enter_URL_Here)');
};

const insertLink = () => {
    insertAtCursor('[Link Text](URL)');
};
</script>

<style scoped>
.minimal-editor {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.editor-toolbar {
  background: var(--bg-elevated);
}
textarea:focus {
    box-shadow: none;
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-color: var(--accent);
}
</style>
