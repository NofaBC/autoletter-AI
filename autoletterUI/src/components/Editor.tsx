import React, { useRef, useState, useCallback } from 'react';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';
import { LinkModal } from './LinkModal';
import { applyFormat, applyLink } from '../lib/rte';

interface EditorProps {
  subject: string;
  fromName: string;
  fromEmail: string;
  previewText: string;
  bodyHtml: string;
  onSubjectChange: (value: string) => void;
  onFromNameChange: (value: string) => void;
  onPreviewTextChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  subject,
  fromName,
  fromEmail,
  previewText,
  bodyHtml,
  onSubjectChange,
  onFromNameChange,
  onPreviewTextChange,
  onBodyChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const savedSelection = useRef<Range | null>(null);

  const handleFormat = useCallback((cmd: 'bold' | 'italic') => {
    applyFormat(cmd);
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const insertList = useCallback((ordered: boolean) => {
    applyFormat(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const handleLinkClick = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!range.toString()) {
      // Show subtle hint
      const linkButton = document.querySelector('button[title="Link"]');
      if (linkButton) {
        const hint = document.createElement('div');
        hint.textContent = 'Please select text first';
        hint.className = 'absolute -top-8 left-0 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg z-10 whitespace-nowrap';
        
        const parent = linkButton.parentElement;
        if (parent) {
          parent.style.position = 'relative';
          parent.appendChild(hint);
          setTimeout(() => hint.remove(), 2000);
        }
      }
      return;
    }
    
    // Save the current selection before modal opens
    savedSelection.current = range.cloneRange();
    setShowLinkModal(true);
  }, []);

  const insertLink = useCallback((url: string) => {
    if (!editorRef.current) return;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore the saved selection
    if (savedSelection.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection.current);
      }
    }
    
    // Now apply the link to the restored selection
    const success = applyLink(url);
    
    if (success) {
      // Add target and rel attributes
      setTimeout(() => {
        const links = editorRef.current!.querySelectorAll('a:not([target])');
        links.forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
        onBodyChange(editorRef.current!.innerHTML);
      }, 50);
    }
    
    // Clear the saved selection
    savedSelection.current = null;
  }, [onBodyChange]);

  const insertVariable = useCallback((variable: string) => {
    const varText = `{{${variable}}}`;
    if (!editorRef.current) return;

    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection) return;

    let range;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // Create range at the end if no selection
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }

    const textNode = document.createTextNode(varText);
    range.deleteContents();
    range.insertNode(textNode);
    
    // Move cursor after the variable
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    onBodyChange(editorRef.current.innerHTML);
  }, [onBodyChange]);

  const handleEditorChange = useCallback(() => {
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  // Initialize editor with bodyHtml if provided
  React.useEffect(() => {
    if (editorRef.current && bodyHtml && editorRef.current.innerHTML !== bodyHtml) {
      editorRef.current.innerHTML = bodyHtml;
    }
  }, [bodyHtml]);

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compose Newsletter</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your newsletter subject"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                From Name
              </label>
              <input
                id="fromName"
                type="text"
                value={fromName}
                onChange={(e) => onFromNameChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                From Email (read-only)
              </label>
              <input
                id="fromEmail"
                type="email"
                value={fromEmail}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="previewText" className="block text-sm font-medium text-gray-700 mb-1">
              Preview Text
            </label>
            <input
              id="previewText"
              type="text"
              value={previewText}
              onChange={(e) => onPreviewTextChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Text that appears in email preview"
            />
          </div>

          <div>
            <label id="editor-label" className="block text-sm font-medium text-gray-700 mb-1">
              Newsletter Content *
            </label>
            
            <div className="border border-gray-300 rounded-md">
              <div className="border-b border-gray-300 p-2 bg-gray-50">
                <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Text formatting">
                  <button
                    type="button"
                    onClick={() => handleFormat('bold')}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Bold (toggle)"
                    aria-label="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('italic')}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Italic (toggle)"
                    aria-label="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkClick}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Link"
                    aria-label="Insert link"
                  >
                    <Link size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertList(false)}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Bullet List"
                    aria-label="Bullet list"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertList(true)}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Numbered List"
                    aria-label="Numbered list"
                  >
                    <ListOrdered size={16} />
                  </button>
                </div>
              </div>
              
              <div
                id="editor"
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onPaste={handlePaste}
                className="min-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset whitespace-pre-wrap"
                role="textbox"
                aria-multiline="true"
                aria-labelledby="editor-label"
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insert Variables
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                id="insertVarFirstName"
                onClick={() => insertVariable('firstName')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                + First Name
              </button>
              <button
                type="button"
                id="insertVarCompany"
                onClick={() => insertVariable('company')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                + Company
              </button>
              <button
                type="button"
                id="insertVarLastSeen"
                onClick={() => insertVariable('lastSeen')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                + Last Seen
              </button>
            </div>
          </div>
        </div>
      </div>

      <LinkModal 
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onConfirm={insertLink}
      />
    </>
  );
};