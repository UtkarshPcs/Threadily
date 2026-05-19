export const APP_CONFIG = {
  name: 'Threads Composer Studio',
  description: 'Professional thread creation and publishing tool',
  maxCharsPerBlock: 500,
  autoSaveInterval: 3000,
  maxBlocks: 50,
  splitWarningThreshold: 450,
  splitDangerThreshold: 500,
} as const;

export const KEYBOARD_SHORTCUTS = {
  newThread: 'ctrl+n',
  save: 'ctrl+s',
  publish: 'ctrl+shift+p',
  splitBlock: 'ctrl+enter',
  preview: 'ctrl+shift+v',
  search: 'ctrl+k',
} as const;
