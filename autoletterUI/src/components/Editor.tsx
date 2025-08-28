import React, { useRef, useState, useCallback } from 'react';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';
import { LinkModal } from './LinkModal';

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

  const toggleFormat = useCallback((tag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Check if we're already in this format
    let parentElement = range.commonAncestorContainer as HTMLElement;
    if (parentElement.nodeType === Node.TEXT_NODE) {
      parentElement = parentElement.parentElement as HTMLElement;
    }

    // Check if current selection or parent has the tag
    let hasFormat = false;
    let formatElement = parentElement;
    while (formatElement && formatElement !== editorRef.current) {
      if (formatElement.tagName?.toLowerCase() === tag.toLowerCase()) {
        hasFormat = true;
        break;
      }
      formatElement = formatElement.parentElement as HTMLElement;
    }

    if (hasFormat && formatElement) {
      // Remove formatting
      const parent = formatElement.parentElement;
      if (parent) {
        while (formatElement.firstChild) {
          parent.insertBefore(formatElement.firstChild, formatElement);
        }
        parent.removeChild(formatElement);
      }
    } else {
      // Apply formatting
      const selectedText = range.toString();
      if (selectedText) {
        const wrapper = document.createElement(tag);
        try {
          range.surroundContents(wrapper);
        } catch {
          // If surroundContents fails (partial selection), extract and wrap
          const contents = range.extractContents();
          wrapper.appendChild(contents);
          range.insertNode(wrapper);
        }
        
        // Reselect the text
        range.selectNodeContents(wrapper);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const insertList = useCallback((ordered: boolean) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Split selected text into lines for multiple list items
    const lines = selectedText ? selectedText.split('\n').filter(line => line.trim()) : [''];
    
    const listElement = document.createElement(ordered ? 'ol' : 'ul');
    
    lines.forEach(line => {
      const listItem = document.createElement('li');
      listItem.textContent = line || 'List item';
      listElement.appendChild(listItem);
    });
    
    range.deleteContents();
    range.insertNode(listElement);
    
    // Position cursor inside the first list item
    const firstLi = listElement.querySelector('li');
    if (firstLi) {
      range.selectNodeContents(firstLi);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    onBodyChange(editorRef.current.innerHTML);
  }, [onBodyChange]);

  const handleLinkClick = useCallback(() => {
    setShowLinkModal(true);
  }, []);

  const insertLink = useCallback((url: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    editorRef.current.focus();

    let range;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // Create range at current position if no selection
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }

    const selectedText = range.toString();
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-blue-600 underline hover:text-blue-700';
    
    if (selectedText) {
      // Wrap selected text in link
      try {
        range.surroundContents(link);
      } catch {
        // If surroundContents fails, extract and wrap
        const contents = range.extractContents();
        link.appendChild(contents);
        range.insertNode(link);
      }
    } else {
      // No text selected - insert the URL as link text
      link.textContent = url;
      range.insertNode(link);
    }
    
    // Move cursor after the link
    range.setStartAfter(link);
    range.setEndAfter(link);
    selection.removeAllRanges();
    selection.addRange(range);
    
    onBodyChange(editorRef.current.innerHTML);
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
                    onClick={() => toggleFormat('strong')}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Bold (toggle)"
                    aria-label="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFormat('em')}
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
                className="min-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ whiteSpace: 'pre-wrap' }}
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