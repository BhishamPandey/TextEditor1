import React, { useState, useRef, useEffect } from 'react';
import './TextEditor.scss';
import Bold from '../Formatting/Bold';

interface TextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent = '', 
  onChange 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
    
        const range = selection.getRangeAt(0);
        console.log("line number 41",selection.toString());
        const fragment = range.cloneContents();
        console.log(fragment);
      
      if (onChange) {
        onChange(newContent);
      }
    }
  };


  return (
    <div className="text-editor">
      <div className="toolbar">
        <Bold/>
      </div>

      <div
   
        ref={editorRef}
        contentEditable
        onBlur={handleContentChange}
  
        className="editor-area"
        role="textbox"
        spellCheck={true}
        suppressContentEditableWarning
      >
        <p     className="editor-paragraph ltr" dir="ltr">
        <br></br>
        </p>
      </div>
    </div>
  );
};

export default TextEditor;
