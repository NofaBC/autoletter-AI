import React, { useRef } from 'react';

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

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (variable: string) => {
    const varText = `{{${variable}}}`;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, varText);
      onBodyChange(editorRef.current.innerHTML);
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  return (
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
                  onClick={() => applyFormat('bold')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Bold"
                  aria-label="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => applyFormat('italic')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Italic"
                  aria-label="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  onClick={handleLink}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Link"
                  aria-label="Insert link"
                >
                  🔗
                </button>
                <button
                  onClick={() => applyFormat('insertUnorderedList')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Bullet List"
                  aria-label="Bullet list"
                >
                  • List
                </button>
                <button
                  onClick={() => applyFormat('insertOrderedList')}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  title="Numbered List"
                  aria-label="Numbered list"
                >
                  1. List
                </button>
              </div>
            </div>
            
            <div
              id="editor"
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              className="min-h-[300px] p-4 focus:outline-none relative"
              style={{ whiteSpace: 'pre-wrap' }}
              data-placeholder="Start typing your newsletter content..."
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
              id="insertVarFirstName"
              onClick={() => insertVariable('firstName')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              + First Name
            </button>
            <button
              id="insertVarCompany"
              onClick={() => insertVariable('company')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              + Company
            </button>
            <button
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
  );
};