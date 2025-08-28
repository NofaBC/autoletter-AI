export type RteCmd =
  | 'bold'
  | 'italic'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'unlink';

export function applyFormat(cmd: RteCmd): boolean {
  if (typeof document.execCommand === 'function') {
    return document.execCommand(cmd, false);
  }

  return false;
}

export function applyLink(href: string): boolean {
  if (!href) return false;
  return document.execCommand('createLink', false, href);
}

// Optional: toolbar "active" state helper
export function isActive(cmd: 'bold' | 'italic'): boolean {
  try {
    return !!document.queryCommandState(cmd);
  } catch {
    return false;
  }
}