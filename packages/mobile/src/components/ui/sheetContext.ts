import { createContext, useContext } from 'react';

/**
 * True inside a <Sheet>. Text inputs there must be the bottom-sheet library's own TextInput, or the
 * sheet is not told the keyboard opened and the keyboard covers it (seen on an Android phone).
 */
const SheetContext = createContext(false);

export const SheetProvider = SheetContext.Provider;
export const useInSheet = (): boolean => useContext(SheetContext);
