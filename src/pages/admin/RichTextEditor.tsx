import { useEffect, useRef, useState } from 'react';
import { uploadToPortfolioBucket } from '../../lib/supabaseClient';
import './RichTextEditor.css';

const BUTTONS: { cmd: string; icon: string; label: string }[] = [
  { cmd: 'bold', icon: 'bi-type-bold', label: 'Bold' },
  { cmd: 'italic', icon: 'bi-type-italic', label: 'Italic' },
  { cmd: 'underline', icon: 'bi-type-underline', label: 'Underline' },
  { cmd: 'formatBlock:H2', icon: 'bi-type-h2', label: 'Heading' },
  { cmd: 'formatBlock:H3', icon: 'bi-type-h3', label: 'Subheading' },
  { cmd: 'insertUnorderedList', icon: 'bi-list-ul', label: 'Bullet list' },
  { cmd: 'insertOrderedList', icon: 'bi-list-ol', label: 'Numbered list' },
  { cmd: 'formatBlock:BLOCKQUOTE', icon: 'bi-quote', label: 'Quote' },
];

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

  function exec(cmd: string) {
    ref.current?.focus();
    if (cmd.startsWith('formatBlock:')) {
      document.execCommand('formatBlock', false, cmd.split(':')[1]);
    } else {
      document.execCommand(cmd, false);
    }
    emit();
  }

  function handleLink() {
    const url = window.prompt('Link URL:');
    if (url) {
      ref.current?.focus();
      document.execCommand('createLink', false, url);
      emit();
    }
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'blog-content');
      ref.current?.focus();
      document.execCommand('insertImage', false, url);
      emit();
    } catch {
      window.alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="rte">
      <div className="rte__toolbar">
        {BUTTONS.map((b) => (
          <button key={b.cmd} type="button" title={b.label} onClick={() => exec(b.cmd)}>
            <i className={`bi ${b.icon}`} />
          </button>
        ))}
        <button type="button" title="Link" onClick={handleLink}>
          <i className="bi bi-link-45deg" />
        </button>
        <button type="button" title="Insert image" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <i className={`bi ${uploading ? 'bi-hourglass-split' : 'bi-image'}`} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
      </div>
      <div ref={ref} className="rte__area" contentEditable onInput={emit} onBlur={emit} />
    </div>
  );
}