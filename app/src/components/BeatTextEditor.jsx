import React, { useRef, useEffect, useState } from 'react';
import './beat-text-editor.css';

function createBeatElement(beatData) {
    const { id, type, color, text = '', sourceLesson } = beatData;

    const beatEl = document.createElement('span');
    beatEl.className = 'beat-box editing';
    beatEl.dataset.beatId = id;
    beatEl.dataset.beatType = type;
    beatEl.dataset.color = color;
    beatEl.dataset.createdAt = String(Date.now());
    if (sourceLesson) {
        beatEl.dataset.sourceLesson = sourceLesson;
    }
    beatEl.style.backgroundColor = color;

    const content = document.createElement('span');
    content.className = 'beat-content';
    content.contentEditable = 'true';
    content.spellCheck = false;
    content.innerText = text || type;
    beatEl.appendChild(content);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'beat-delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', 'Delete beat');
    beatEl.appendChild(deleteBtn);

    return beatEl;
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export default function BeatTextEditor({ value, onChange, placeholder, pendingInsert, onConsumeInsert }) {
    const editorRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize editor content
    useEffect(() => {
        if (!editorRef.current || isInitialized) return;

        const editor = editorRef.current;
        if (value) {
            editor.innerHTML = value;
        }
        setIsInitialized(true);
    }, [value, isInitialized]);

    // Handle pending beat insertion
    useEffect(() => {
        if (!pendingInsert || !editorRef.current) return;

        const editor = editorRef.current;
        const selection = window.getSelection();

        // Create beat element
        const beatData = {
            id: generateId(),
            ...pendingInsert
        };
        const beatEl = createBeatElement(beatData);

        // Insert at cursor position
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.collapse(true);
            range.insertNode(beatEl);

            // Place cursor after the beat
            range.setStartAfter(beatEl);
            range.collapse(true);
        } else {
            editor.appendChild(beatEl);
        }

        // Focus the beat content for editing
        const content = beatEl.querySelector('.beat-content');
        if (content) {
            content.focus();
            // Select all text in the beat
            const range = document.createRange();
            range.selectNodeContents(content);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        onConsumeInsert?.();
    }, [pendingInsert, onConsumeInsert]);

    // Handle editor changes
    const handleInput = () => {
        if (!editorRef.current) return;
        const content = editorRef.current.innerHTML;
        onChange?.(content);
    };

    // Handle click events (for delete buttons and beat sealing)
    const handleClick = (event) => {
        const deleteBtn = event.target.closest('.beat-delete');
        if (deleteBtn) {
            event.preventDefault();
            const beatBox = deleteBtn.closest('.beat-box');
            if (beatBox) {
                beatBox.remove();
                handleInput();
            }
            return;
        }

        // Handle beat content clicking
        const beatContent = event.target.closest('.beat-content');
        if (beatContent) {
            const beatBox = beatContent.closest('.beat-box');
            if (beatBox && beatBox.classList.contains('sealed')) {
                // Unseal the beat for editing
                beatBox.classList.remove('sealed');
                beatBox.classList.add('editing');
                beatContent.contentEditable = 'true';
                beatContent.focus();
            }
        }
    };

    // Handle enter key in beat content to seal it
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            const beatContent = event.target.closest('.beat-content');
            if (beatContent) {
                event.preventDefault();
                const beatBox = beatContent.closest('.beat-box');
                if (beatBox) {
                    // Seal the beat
                    beatBox.classList.remove('editing');
                    beatBox.classList.add('sealed');
                    beatContent.contentEditable = 'false';

                    // Place cursor after the beat
                    const range = document.createRange();
                    range.setStartAfter(beatBox);
                    range.collapse(true);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    handleInput();
                }
            }
        }
    };

    return (
        <div
            ref={editorRef}
            className="beat-text-editor"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="textbox"
            aria-multiline="true"
            data-placeholder={placeholder}
        />
    );
}
