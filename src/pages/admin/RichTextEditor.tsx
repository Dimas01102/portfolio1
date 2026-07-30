import { useEffect, useRef, useState } from 'react';
import { uploadToPortfolioBucket } from '../../lib/supabaseClient';
import './RichTextEditor.css';

type Btn = { cmd: string; icon: string; label: string };

const GROUP_BLOCK: Btn[] = [
  { cmd: 'formatBlock:P', icon: 'bi-text-paragraph', label: 'Paragraph' },
  { cmd: 'formatBlock:H2', icon: 'bi-type-h2', label: 'Heading 2' },
  { cmd: 'formatBlock:H3', icon: 'bi-type-h3', label: 'Heading 3' },
  { cmd: 'formatBlock:H4', icon: 'bi-type-h4', label: 'Heading 4' },
];

const GROUP_INLINE: Btn[] = [
  { cmd: 'bold', icon: 'bi-type-bold', label: 'Bold' },
  { cmd: 'italic', icon: 'bi-type-italic', label: 'Italic' },
  { cmd: 'underline', icon: 'bi-type-underline', label: 'Underline' },
  { cmd: 'strikeThrough', icon: 'bi-type-strikethrough', label: 'Strikethrough' },
];

const GROUP_ALIGN: Btn[] = [
  { cmd: 'justifyLeft', icon: 'bi-text-left', label: 'Align left' },
  { cmd: 'justifyCenter', icon: 'bi-text-center', label: 'Align center' },
  { cmd: 'justifyRight', icon: 'bi-text-right', label: 'Align right' },
];

const GROUP_LIST: Btn[] = [
  { cmd: 'insertUnorderedList', icon: 'bi-list-ul', label: 'Bullet list' },
  { cmd: 'insertOrderedList', icon: 'bi-list-ol', label: 'Numbered list' },
  { cmd: 'formatBlock:BLOCKQUOTE', icon: 'bi-quote', label: 'Quote' },
  { cmd: 'formatBlock:PRE', icon: 'bi-code-square', label: 'Code block' },
];

const HIGHLIGHT_COLORS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', 'transparent'];
const TEXT_COLORS = ['#e11d48', '#2563eb', '#16a34a', '#d97706', 'inherit'];

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const savedRange = useRef<Range | null>(null);

  // The parent renders this with key={editingId || 'new'}, which remounts
  // it fresh per post — so it's safe to set innerHTML once on mount and
  // treat it as an uncontrolled contentEditable editor from then on.
  useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p');
    if (ref.current) ref.current.innerHTML = value || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    onChange(ref.current?.innerHTML || '');
  }

  function focusEditor() {
    ref.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function exec(cmd: string, value?: string) {
    focusEditor();
    if (cmd.startsWith('formatBlock:')) {
      document.execCommand('formatBlock', false, cmd.split(':')[1]);
    } else {
      document.execCommand(cmd, false, value);
    }
    emit();
  }

  function handleLink() {
    const url = window.prompt('Link URL:');
    if (url) {
      focusEditor();
      document.execCommand('createLink', false, url);
      emit();
    }
  }

  function handleTable() {
    const rowsInput = window.prompt('Number of rows:', '3');
    const colsInput = window.prompt('Number of columns:', '3');
    const rows = Math.max(1, Math.min(20, parseInt(rowsInput || '3', 10) || 3));
    const cols = Math.max(1, Math.min(10, parseInt(colsInput || '3', 10) || 3));

    let html = '<table class="rte-table"><thead><tr>';
    for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';

    focusEditor();
    document.execCommand('insertHTML', false, html);
    emit();
  }

  function handleHr() {
    focusEditor();
    document.execCommand('insertHorizontalRule', false);
    emit();
  }

  function handleClearFormat() {
    focusEditor();
    document.execCommand('removeFormat', false);
    document.execCommand('formatBlock', false, 'P');
    emit();
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'blog-content');
      focusEditor();
      document.execCommand('insertImage', false, url);
      emit();
    } catch {
      window.alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function applyColor(kind: 'text' | 'highlight', color: string) {
    focusEditor();
    document.execCommand(kind === 'text' ? 'foreColor' : 'hiliteColor', false, color);
    emit();
    setShowTextColor(false);
    setShowHighlight(false);
  }

  return (
    <div className="rte">
      <div className="rte__toolbar" onMouseDown={saveSelection}>
        <select
          className="rte__select"
          title="Paragraph style"
          onChange={(e) => exec(`formatBlock:${e.target.value}`)}
          defaultValue=""
        >
          <option value="" disabled>Style</option>
          {GROUP_BLOCK.map((b) => (
            <option key={b.cmd} value={b.cmd.split(':')[1]}>{b.label}</option>
          ))}
        </select>

        <span className="rte__sep" />

        {GROUP_INLINE.map((b) => (
          <button key={b.cmd} type="button" title={b.label} onClick={() => exec(b.cmd)}>
            <i className={`bi ${b.icon}`} />
          </button>
        ))}

        <span className="rte__sep" />

        <div className="rte__popover-wrap">
          <button type="button" title="Text color" onClick={() => { setShowHighlight(false); setShowTextColor((v) => !v); }}>
            <i className="bi bi-palette" />
          </button>
          {showTextColor && (
            <div className="rte__popover">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rte__swatch"
                  style={{ background: c === 'inherit' ? 'var(--text-primary)' : c }}
                  title={c}
                  onClick={() => applyColor('text', c)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rte__popover-wrap">
          <button type="button" title="Highlight" onClick={() => { setShowTextColor(false); setShowHighlight((v) => !v); }}>
            <i className="bi bi-brush" />
          </button>
          {showHighlight && (
            <div className="rte__popover">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rte__swatch"
                  style={{ background: c === 'transparent' ? 'var(--bg-secondary)' : c }}
                  title={c}
                  onClick={() => applyColor('highlight', c)}
                />
              ))}
            </div>
          )}
        </div>

        <span className="rte__sep" />

        {GROUP_ALIGN.map((b) => (
          <button key={b.cmd} type="button" title={b.label} onClick={() => exec(b.cmd)}>
            <i className={`bi ${b.icon}`} />
          </button>
        ))}

        <span className="rte__sep" />

        {GROUP_LIST.map((b) => (
          <button key={b.cmd} type="button" title={b.label} onClick={() => exec(b.cmd)}>
            <i className={`bi ${b.icon}`} />
          </button>
        ))}

        <span className="rte__sep" />

        <button type="button" title="Link" onClick={handleLink}>
          <i className="bi bi-link-45deg" />
        </button>
        <button type="button" title="Insert table" onClick={handleTable}>
          <i className="bi bi-table" />
        </button>
        <button type="button" title="Insert image" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <i className={`bi ${uploading ? 'bi-hourglass-split' : 'bi-image'}`} />
        </button>
        <button type="button" title="Horizontal rule" onClick={handleHr}>
          <i className="bi bi-hr" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImagePick} />

        <span className="rte__sep" />

        <button type="button" title="Undo" onClick={() => exec('undo')}>
          <i className="bi bi-arrow-counterclockwise" />
        </button>
        <button type="button" title="Redo" onClick={() => exec('redo')}>
          <i className="bi bi-arrow-clockwise" />
        </button>
        <button type="button" title="Clear formatting" onClick={handleClearFormat}>
          <i className="bi bi-eraser" />
        </button>
      </div>
      <div
        ref={ref}
        className="rte__area"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      />
    </div>
  );
}