import React, { useEffect, useRef } from "react";
import { BeatBoxNode } from "@/lib/beatTypes";
import { load, save } from "@/lib/storage";
import { useUndo } from "@/state/useUndo";
import "./beat-editor.css";

type TextSegment = { kind: "text"; text: string };
type BeatSegment = { kind: "beat"; beat: BeatBoxNode };

type EditorState = {
  nodes: Array<TextSegment | BeatSegment>;
};

const KEY = "editor";
const IMPORT_EVENT = "beat-editor:import";

function emptyState(): EditorState {
  return { nodes: [] };
}

function cloneState(state: EditorState): EditorState {
  return JSON.parse(JSON.stringify(state));
}

function serialize(state: EditorState) {
  save(KEY, state);
}

function deserialize(): EditorState {
  return load<EditorState>(KEY, emptyState());
}

function uuid() {
  return `b${Math.random().toString(36).slice(2, 10)}`;
}

function createBeatElement(node: BeatBoxNode) {
  const el = document.createElement("span");
  el.className = "beat-box";
  el.dataset.beatId = node.id;
  el.dataset.beatType = node.type;
  el.dataset.color = node.color;
  el.dataset.createdAt = String(node.createdAt);
  if (node.sourceLesson) {
    el.dataset.sourceLesson = node.sourceLesson;
  }
  el.dataset.sealed = node.sealed ? "true" : "false";
  el.style.backgroundColor = node.color;

  const content = document.createElement("span");
  content.className = "beat-content";
  content.contentEditable = node.sealed ? "false" : "true";
  content.spellcheck = false;
  content.innerText = node.text;
  el.appendChild(content);

  const del = document.createElement("button");
  del.type = "button";
  del.className = "beat-delete";
  del.textContent = "×";
  del.setAttribute("aria-label", "Delete beat");
  el.appendChild(del);

  if (node.sealed) {
    el.classList.add("sealed");
  } else {
    el.classList.add("editing");
  }

  return el;
}

function findBeatElement(root: HTMLElement, id: string) {
  return root.querySelector<HTMLElement>(`[data-beat-id="${id}"]`);
}

function normalizeStructure(root: HTMLDivElement) {
  let node: ChildNode | null = root.firstChild;
  while (node) {
    const next = node.nextSibling;
    if (node instanceof HTMLElement) {
      if (node.dataset?.beatId) {
        const content = node.querySelector<HTMLElement>(".beat-content");
        content?.querySelectorAll("br").forEach((br) => {
          br.replaceWith(document.createTextNode("\n"));
        });
      } else if (node.tagName === "BR") {
        root.replaceChild(document.createTextNode("\n"), node);
      } else {
        const isBlock = /^(DIV|P|SECTION|ARTICLE|UL|OL|LI)$/i.test(node.tagName);
        let insertedBreak = false;
        while (node.firstChild) {
          const child = node.firstChild;
          if (child instanceof HTMLElement && child.tagName === "BR") {
            root.insertBefore(document.createTextNode("\n"), node);
            node.removeChild(child);
            insertedBreak = true;
          } else {
            root.insertBefore(child, node);
          }
        }
        if (isBlock && !insertedBreak) {
          root.insertBefore(document.createTextNode("\n"), node);
        }
        root.removeChild(node);
      }
    }
    node = next;
  }
  root.normalize();
}

function readStateFromDom(root: HTMLDivElement): EditorState {
  normalizeStructure(root);
  const nodes: EditorState["nodes"] = [];
  const children = Array.from(root.childNodes);
  children.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      nodes.push({ kind: "text", text: child.textContent ?? "" });
      return;
    }
    if (child instanceof HTMLElement && child.dataset.beatId) {
      const content = child.querySelector<HTMLElement>(".beat-content");
      const text = content?.innerText ?? "";
      const sealed = child.dataset.sealed !== "false";
      const beat: BeatBoxNode = {
        id: child.dataset.beatId,
        type: child.dataset.beatType ?? "",
        text,
        sealed,
        color: child.dataset.color ?? child.style.backgroundColor ?? "",
        createdAt: Number(child.dataset.createdAt) || Date.now(),
        sourceLesson: child.dataset.sourceLesson || undefined,
      };
      nodes.push({ kind: "beat", beat });
      return;
    }
    if (child instanceof HTMLElement && child.tagName === "BR") {
      root.replaceChild(document.createTextNode("\n"), child);
      nodes.push({ kind: "text", text: "\n" });
      return;
    }
    if (child instanceof HTMLElement) {
      nodes.push({ kind: "text", text: child.innerText });
    }
  });
  return { nodes };
}

function applyStateToDom(root: HTMLDivElement, state: EditorState) {
  root.innerHTML = "";
  for (const node of state.nodes) {
    if (node.kind === "text") {
      if (node.text) {
        root.appendChild(document.createTextNode(node.text));
      } else {
        root.appendChild(document.createTextNode(""));
      }
    } else {
      const beatEl = createBeatElement(node.beat);
      root.appendChild(beatEl);
    }
  }
  root.normalize();
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function placeCaretAfter(node: Node) {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export type BeatInsert = { type: string; color: string; sourceLesson?: string };

export default function BeatEditor(props: {
  pendingInsert?: BeatInsert | null;
  onConsumeInsert?: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<EditorState>(emptyState());
  const undo = useUndo<EditorState>(emptyState());
  const editingIdRef = useRef<string | null>(null);
  const suppressPersistRef = useRef(false);

  useEffect(() => {
    const initial = deserialize();
    stateRef.current = cloneState(initial);
    undo.reset(cloneState(initial));
    if (editorRef.current) {
      suppressPersistRef.current = true;
      applyStateToDom(editorRef.current, initial);
      suppressPersistRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleImport = () => {
      const next = deserialize();
      stateRef.current = cloneState(next);
      undo.reset(cloneState(next));
      if (editorRef.current) {
        suppressPersistRef.current = true;
        applyStateToDom(editorRef.current, next);
        suppressPersistRef.current = false;
      }
      editingIdRef.current = null;
    };
    document.addEventListener(IMPORT_EVENT, handleImport);
    return () => document.removeEventListener(IMPORT_EVENT, handleImport);
  }, []);

  useEffect(() => {
    if (!props.pendingInsert) return;
    const root = editorRef.current;
    if (!root) return;

    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const anchorNode = selection.anchorNode as HTMLElement | null;
      const beatAncestor = anchorNode?.closest?.("[data-beat-id]") as HTMLElement | null;
      if (beatAncestor && beatAncestor.parentElement) {
        range.setStartAfter(beatAncestor);
        range.collapse(true);
      }
    }

    const beat: BeatBoxNode = {
      id: uuid(),
      type: props.pendingInsert.type,
      text: "",
      sealed: false,
      color: props.pendingInsert.color,
      createdAt: Date.now(),
      sourceLesson: props.pendingInsert.sourceLesson,
    };

    const beatEl = createBeatElement(beat);
    const selectionRange = window.getSelection()?.getRangeAt(0);
    if (selectionRange) {
      selectionRange.collapse(true);
      selectionRange.insertNode(beatEl);
    } else {
      root.appendChild(beatEl);
    }

    const content = beatEl.querySelector<HTMLElement>(".beat-content");
    if (content) {
      content.focus();
      placeCaretAtEnd(content);
    }
    editingIdRef.current = beat.id;
    commitSnapshot(true);
    props.onConsumeInsert?.();
  }, [props.pendingInsert, props.onConsumeInsert]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const editingId = editingIdRef.current;
      if (!editingId) return;
      const root = editorRef.current;
      if (!root) return;
      const beatEl = findBeatElement(root, editingId);
      if (!beatEl) {
        editingIdRef.current = null;
        return;
      }
      if (beatEl.contains(event.target as Node)) return;
      sealBeat(beatEl, true);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const editingId = editingIdRef.current;
        if (!editingId) return;
        const root = editorRef.current;
        if (!root) return;
        const beatEl = findBeatElement(root, editingId);
        if (beatEl) {
          event.preventDefault();
          sealBeat(beatEl, true);
        }
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const handleInput = () => {
      if (suppressPersistRef.current) return;
      commitSnapshot(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        const prev = undo.undo();
        stateRef.current = cloneState(prev);
        serialize(prev);
        if (root) {
          suppressPersistRef.current = true;
          applyStateToDom(root, prev);
          suppressPersistRef.current = false;
        }
        return;
      }
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z")) {
        event.preventDefault();
        const next = undo.redo();
        stateRef.current = cloneState(next);
        serialize(next);
        if (root) {
          suppressPersistRef.current = true;
          applyStateToDom(root, next);
          suppressPersistRef.current = false;
        }
        return;
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        if (removeAdjacentBeat(root, event.key === "Backspace" ? "backward" : "forward")) {
          event.preventDefault();
          commitSnapshot(true);
        }
      }
    };

    const handleDblClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-beat-id]");
      if (!target) return;
      const content = target.querySelector<HTMLElement>(".beat-content");
      if (!content) return;
      editingIdRef.current = target.dataset.beatId ?? null;
      target.classList.add("editing");
      target.classList.remove("sealed");
      target.dataset.sealed = "false";
      content.contentEditable = "true";
      content.focus();
      placeCaretAtEnd(content);
    };

    const handleClick = (event: MouseEvent) => {
      const deleteBtn = (event.target as HTMLElement).closest<HTMLButtonElement>(".beat-delete");
      if (deleteBtn) {
        event.preventDefault();
        const beat = deleteBtn.closest<HTMLElement>("[data-beat-id]");
        if (beat) {
          beat.remove();
          if (editingIdRef.current === beat.dataset.beatId) {
            editingIdRef.current = null;
          }
          commitSnapshot(true);
        }
      }
    };

    const handleContext = (event: MouseEvent) => {
      const beat = (event.target as HTMLElement).closest<HTMLElement>("[data-beat-id]");
      if (!beat) return;
      event.preventDefault();
      const id = beat.dataset.beatId;
      if (!id) return;
      const ev = new CustomEvent("beat:request-swap", { detail: { id }, bubbles: true });
      beat.dispatchEvent(ev);
    };

    const handlePaste = (event: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      commitSnapshot(false);
    };

    root.addEventListener("input", handleInput);
    root.addEventListener("keydown", handleKeyDown as unknown as EventListener);
    root.addEventListener("dblclick", handleDblClick);
    root.addEventListener("click", handleClick);
    root.addEventListener("contextmenu", handleContext);
    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("input", handleInput);
      root.removeEventListener("keydown", handleKeyDown as unknown as EventListener);
      root.removeEventListener("dblclick", handleDblClick);
      root.removeEventListener("click", handleClick);
      root.removeEventListener("contextmenu", handleContext);
      root.removeEventListener("paste", handlePaste);
    };
  }, []);

  useEffect(() => {
    const handleSwap = (event: Event) => {
      const { id, next } = (event as CustomEvent).detail as {
        id: string;
        next: { id: string; color: string };
      };
      const root = editorRef.current;
      if (!root) return;
      const beat = findBeatElement(root, id);
      if (!beat) return;
      beat.dataset.beatType = next.id;
      beat.dataset.color = next.color;
      beat.style.backgroundColor = next.color;
      commitSnapshot(true);
    };
    document.addEventListener("beat:perform-swap", handleSwap as EventListener);
    return () => document.removeEventListener("beat:perform-swap", handleSwap as EventListener);
  }, []);

  const commitSnapshot = (pushHistory: boolean) => {
    const root = editorRef.current;
    if (!root) return;
    suppressPersistRef.current = true;
    const snapshot = readStateFromDom(root);
    suppressPersistRef.current = false;
    stateRef.current = cloneState(snapshot);
    serialize(snapshot);
    if (pushHistory) {
      undo.set(cloneState(snapshot));
    }
  };

  const sealBeat = (beatEl: HTMLElement, pushHistory: boolean) => {
    const content = beatEl.querySelector<HTMLElement>(".beat-content");
    if (!content) return;
    const text = content.innerText.trim();
    if (!text) {
      const parent = beatEl.parentNode;
      if (parent) {
        const placeholder = document.createTextNode("");
        parent.insertBefore(placeholder, beatEl);
        beatEl.remove();
        placeCaretAfter(placeholder);
        placeholder.remove();
      } else {
        beatEl.remove();
      }
      editingIdRef.current = null;
      commitSnapshot(pushHistory);
      return;
    }
    beatEl.dataset.sealed = "true";
    beatEl.classList.remove("editing");
    beatEl.classList.add("sealed");
    content.contentEditable = "false";
    placeCaretAfter(beatEl);
    editingIdRef.current = null;
    commitSnapshot(pushHistory);
  };

  const removeAdjacentBeat = (root: HTMLDivElement, direction: "forward" | "backward") => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      return false;
    }
    const range = selection.getRangeAt(0);
    let target: Node | null = null;
    if (direction === "backward") {
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        if (range.startOffset > 0) return false;
        target = range.startContainer;
      } else {
        target = range.startContainer.childNodes[range.startOffset - 1] ?? null;
      }
      if (!target) {
        let node: Node | null = range.startContainer;
        while (node && node !== root) {
          if (node.previousSibling) {
            target = node.previousSibling;
            break;
          }
          node = node.parentNode;
        }
      }
    } else {
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const text = range.startContainer.textContent ?? "";
        if (range.startOffset < text.length) return false;
        target = range.startContainer.nextSibling;
      } else {
        target = range.startContainer.childNodes[range.startOffset] ?? null;
      }
      if (!target) {
        let node: Node | null = range.startContainer;
        while (node && node !== root) {
          if (node.nextSibling) {
            target = node.nextSibling;
            break;
          }
          node = node.parentNode;
        }
      }
    }
    if (!target) return false;
    if (target instanceof HTMLElement && target.dataset.beatId) {
      if (editingIdRef.current === target.dataset.beatId) {
        editingIdRef.current = null;
      }
      const parent = target.parentNode;
      if (parent) {
        const placeholder = document.createTextNode("");
        parent.insertBefore(placeholder, direction === "backward" ? target : target.nextSibling);
        target.remove();
        placeCaretAfter(placeholder);
        placeholder.remove();
      } else {
        target.remove();
      }
      return true;
    }
    return false;
  };

  return (
    <div
      ref={editorRef}
      className="beat-editor"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-multiline="true"
    />
  );
}

export function exportEditorState(): string {
  return JSON.stringify(deserialize());
}

export function importEditorState(json: string) {
  try {
    const parsed = JSON.parse(json) as EditorState;
    save(KEY, parsed);
    document.dispatchEvent(new Event(IMPORT_EVENT));
  } catch {
    // ignore malformed payloads
  }
}
