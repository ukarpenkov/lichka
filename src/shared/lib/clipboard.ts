type ClipboardApi = {
  setString: (content: string) => void;
  getString: () => Promise<string>;
};

// Deep import avoids react-native's deprecated Clipboard getter warning.
// Module is still shipped with RN 0.85 (JS default export; .d.ts is mismatched).
const Clipboard = require('react-native/Libraries/Components/Clipboard/Clipboard')
  .default as ClipboardApi;

/** Write plain text to the system clipboard. */
export function setClipboardString(content: string): void {
  Clipboard.setString(content);
}
