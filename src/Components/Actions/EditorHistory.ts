import React from 'react';
interface HistoryEntry {
  html: string;
  selectionState?: {
    startPath: number[];
    startOffset: number;
    endPath: number[];
    endOffset: number;
  };
}


function getNodePath(node: Node, root: Node): number[] {
  const path: number[] = [];
  let current: Node = node;
  
  while (current !== root && current.parentNode) {
    const parent = current.parentNode;
   
    const children = Array.from(parent.childNodes);
   
    const index = children.findIndex(child => child === current);
    
    if (index === -1) break; 
    path.unshift(index);
    current = parent;
  }
  
  return path;
}


function getNodeByPath(path: number[], root: Node): Node | null {
  let current = root;
  
  for (const index of path) {
    if (!current.childNodes || index >= current.childNodes.length) {
      return null;
    }
    current = current.childNodes[index];
  }
  
  return current;
}

export class EditorHistory {
  private static instance: EditorHistory;
  public history: HistoryEntry[] = [];
  public currentIndex: number = -1;
  private maxHistory: number = 50;
  private isRecording: boolean = true;
  private changeListeners: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): EditorHistory {
    if (!EditorHistory.instance) {
      EditorHistory.instance = new EditorHistory();
    }
    return EditorHistory.instance;
  }

  public recordState(html: string, selection: Selection | null, editorNode: Node): void {
    if (!this.isRecording) return;
    
    const entry: HistoryEntry = { html };
    
    
    if (selection && selection.rangeCount > 0 && editorNode) {
      const range = selection.getRangeAt(0);
      
      try {
        const startPath = getNodePath(range.startContainer, editorNode);
        const endPath = getNodePath(range.endContainer, editorNode);
        
        if (startPath.length && endPath.length) {
          entry.selectionState = {
            startPath,
            startOffset: range.startOffset,
            endPath,
            endOffset: range.endOffset
          };
        }
      } catch (e) {
        console.error("Could not save selection paths:", e);
      }
    }
    
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    this.history.push(entry);
    this.currentIndex = this.history.length - 1;
    
   
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
    
    this.notifyChangeListeners();
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public undo(editorRef: React.RefObject<HTMLDivElement | null>): void {
    if (!this.canUndo() || !editorRef.current) return;
    
    this.currentIndex--;
    
    this.isRecording = false;
    
    const entry = this.history[this.currentIndex];
    editorRef.current.innerHTML = entry.html;  
  
    if (entry.selectionState && editorRef.current) {
      try {
        const startNode = getNodeByPath(entry.selectionState.startPath, editorRef.current);
        const endNode = getNodeByPath(entry.selectionState.endPath, editorRef.current);
        
        if (startNode && endNode) {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.setStart(startNode, entry.selectionState.startOffset);
            range.setEnd(endNode, entry.selectionState.endOffset);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } catch (e) {
        console.error("Could not restore selection:", e);
      }
    }
    
    setTimeout(() => {
      this.isRecording = true;
    }, 0);
    
    this.notifyChangeListeners();
  }

  public redo(editorRef: React.RefObject<HTMLDivElement | null>): void {
    if (!this.canRedo() || !editorRef.current) return;
    
    this.currentIndex++;
    
    this.isRecording = false;
    
    const entry = this.history[this.currentIndex];
    editorRef.current.innerHTML = entry.html;
    
 
    if (entry.selectionState && editorRef.current) {
      try {
        const startNode = getNodeByPath(entry.selectionState.startPath, editorRef.current);
        const endNode = getNodeByPath(entry.selectionState.endPath, editorRef.current);
        
        if (startNode && endNode) {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.setStart(startNode, entry.selectionState.startOffset);
            range.setEnd(endNode, entry.selectionState.endOffset);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } catch (e) {
        console.error("Could not restore selection:", e);
      }
    }
    
    setTimeout(() => {
      this.isRecording = true;
    }, 0);
    
   
    this.notifyChangeListeners();
  }

  public addChangeListener(listener: () => void): void {
    this.changeListeners.push(listener);
  }

  public removeChangeListener(listener: () => void): void {
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }

  private notifyChangeListeners(): void {
    this.changeListeners.forEach(listener => listener());
  }
}