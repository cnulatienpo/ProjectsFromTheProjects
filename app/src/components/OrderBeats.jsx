import React, { useEffect, useState } from 'react';

export default function OrderBeats({ options = [], onChange }) {
  const initial = Array.isArray(options) ? options.map((x) => String(x)) : [];
  const [list, setList] = useState(initial);

  useEffect(() => {
    const next = Array.isArray(options) ? options.map((x) => String(x)) : [];
    setList(next);
    if (onChange) onChange(next);
  }, [options, onChange]);

  function onDragStart(e, idx) {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  }

  function reorder(from, to) {
    if (!Number.isFinite(from)) return;
    const arr = list.slice();
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setList(arr);
    if (onChange) onChange(arr.slice());
  }

  function onDrop(e, idx) {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isFinite(from)) return;
    e.preventDefault();
    e.stopPropagation();
    reorder(from, idx);
  }

  function onDropList(e) {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isFinite(from)) return;
    e.preventDefault();
    reorder(from, list.length);
  }

  return (
    <ul className="border rounded divide-y" onDragOver={(e) => e.preventDefault()} onDrop={onDropList}>
      {list.map((value, index) => (
        <li
          key={`${value}-${index}`}
          className="p-2 cursor-move select-none"
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, index)}
        >
          {value}
        </li>
      ))}
    </ul>
  );
}
