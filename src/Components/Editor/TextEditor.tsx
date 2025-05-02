import React, { useState, useRef, useEffect } from 'react';
import './TextEditor.scss';
import AttachFile from '../AttachFile/AttachFile';
import EmojiPickerComponent from '../EmojiPicker/EmojiPicker';
import TextColor from '../ColourPicker/TextColour';
import BackgroundColor from '../ColourPicker/BackGroundColour';
import CenterAlign from '../Alignment/CenterAlign';
import LeftAlign from '../Alignment/LeftAlign';
import RightAlign from '../Alignment/RightAlign';
import IncreaseIndent from '../Indentation/IncreaseIndent';
import DecreaseIndent from '../Indentation/DecreaseIndent';
import Undo from '../Actions/Undo';
import Redo from '../Actions/Redo';
import Link from '../Link/Link';
import Bold from '../Formatting/Bold';
import Italic from '../Formatting/Italic';
import OrderedList from '../Lists/OrderedList';
import UnorderedList from '../Lists/UnOrderList';
import Format from '../Format/Format';
import UnderLine from '../Formatting/UnderLine';

interface TextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = 'Type Something',
  onChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [lastSelection, setLastSelection] = useState<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    setLastSelection(range.cloneRange());
  };

  const restoreSelection = () => {
    if (lastSelection && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelection);
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      saveSelection();

      if (onChange) {
        onChange(newContent);
      }
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'A') {
      const link = target as HTMLAnchorElement;
      e.preventDefault();

      window.open(link.href, '_blank', 'noopener,noreferrer');

      saveSelection();
    }
  };

  return (
    <div className="text-editor-wrapper">
      <div className="text-editor">
        <div className="toolbar">
          <Undo
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <Redo
            editorRef={editorRef}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <Bold
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <Italic
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <UnderLine
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <TextColor
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <BackgroundColor
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <LeftAlign
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <CenterAlign
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <RightAlign
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <IncreaseIndent
            editorRef={editorRef}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <DecreaseIndent
            editorRef={editorRef}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <OrderedList
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <UnorderedList
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <EmojiPickerComponent
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <AttachFile
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />

          <Format
            editorRef={editorRef}
            lastSelection={lastSelection}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />



          <Link
            editorRef={editorRef}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            onContentChange={handleContentChange}
          />


        </div>

        <div
          ref={editorRef}
          contentEditable
          onBlur={() => {
          saveSelection();
          handleContentChange();
          }}
          onClick={(e) => {
          handleEditorClick(e);
          saveSelection();
          }}
          onKeyUp={saveSelection}
          className="editor-area"
          role="textbox"
          // spellCheck={true}
          suppressContentEditableWarning
          style={{ height: '340px', overflowY: 'auto' }}

        >
          <p>
            <br></br>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;