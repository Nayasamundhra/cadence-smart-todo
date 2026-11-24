import type { ReactNode } from 'react';
import { MenuView, type MenuAction } from '@react-native-menu/menu';

export interface MenuItem {
  id: string;
  title: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  items: readonly MenuItem[];
  onSelect: (id: string) => void;
  /** The trigger. It should itself be accessible (e.g. an IconButton labelled "More actions"). */
  children: ReactNode;
  /** Open on long press instead of tap. */
  openOnLongPress?: boolean;
  testID?: string;
}

/**
 * Context menu. Uses the platform-native menu on both Android (popup menu) and iOS (UIMenu), so it
 * needs no Platform checks here (doc 02 section 2.6, doc 04 section 4.12).
 */
export function Menu({ items, onSelect, children, openOnLongPress = false, testID }: MenuProps) {
  const actions: MenuAction[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    attributes: { destructive: item.destructive, disabled: item.disabled },
  }));
  return (
    <MenuView
      actions={actions}
      shouldOpenOnLongPress={openOnLongPress}
      onPressAction={({ nativeEvent }) => onSelect(nativeEvent.event)}
      testID={testID}
    >
      {children}
    </MenuView>
  );
}
