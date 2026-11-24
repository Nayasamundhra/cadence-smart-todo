import { useState } from 'react';
import { Check, Plus } from '@/design/icons/lucide';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { palette, typography } from '@/design';
import { haptics, setHapticsEnabled } from '@/services/haptics';
import { renderThemed, SCHEMES } from '@/test/renderThemed';
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  IconButton,
  Input,
  Menu,
  SegmentedControl,
  Sheet,
  Slider,
  SnackbarProvider,
  Switch,
  useSnackbar,
} from '.';

describe.each(SCHEMES)('controls in the %s theme', (scheme) => {
  const colors = palette[scheme];

  describe('Button', () => {
    it('is a button named by its label and calls onPress', async () => {
      const onPress = jest.fn();
      await renderThemed(<Button label="Add task" onPress={onPress} />, scheme);
      const button = screen.getByRole('button', { name: 'Add task' });
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['primary', colors.accent],
      ['secondary', colors.surface],
      ['danger', colors.danger],
    ] as const)('%s variant uses the right fill', async (variant, fill) => {
      await renderThemed(<Button label="Go" variant={variant} />, scheme);
      expect(screen.getByRole('button', { name: 'Go' })).toHaveStyle({ backgroundColor: fill });
    });

    it('ghost variant has no fill', async () => {
      await renderThemed(<Button label="Go" variant="ghost" />, scheme);
      expect(screen.getByRole('button', { name: 'Go' })).toHaveStyle({
        backgroundColor: 'transparent',
      });
    });

    it.each([
      ['lg', 52],
      ['md', 44],
      ['sm', 36],
    ] as const)('size %s is %i high', async (size, height) => {
      await renderThemed(<Button label="Go" size={size} />, scheme);
      expect(screen.getByRole('button', { name: 'Go' })).toHaveStyle({ height });
    });

    it('does not fire when disabled and reports the state', async () => {
      const onPress = jest.fn();
      await renderThemed(<Button label="Save" disabled onPress={onPress} />, scheme);
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeDisabled();
      expect(button).toHaveStyle({ opacity: 0.4 });
      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('loading shows a spinner, is busy, ignores presses and keeps its label for layout', async () => {
      const onPress = jest.fn();
      await renderThemed(<Button label="Save" loading onPress={onPress} />, scheme);
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeBusy();
      expect(button).toBeDisabled();
      expect(screen.getByText('Save')).toBeTruthy();
      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('can carry a different accessibility label than its text', async () => {
      await renderThemed(<Button label="Add" accessibilityLabel="Add task" icon={Plus} />, scheme);
      expect(screen.getByRole('button', { name: 'Add task' })).toBeTruthy();
    });
  });

  describe('IconButton', () => {
    it('is a button with its required label and a 44 point hit area', async () => {
      const onPress = jest.fn();
      await renderThemed(
        <IconButton icon={Check} accessibilityLabel="Mark done" onPress={onPress} />,
        scheme,
      );
      const button = screen.getByRole('button', { name: 'Mark done' });
      expect(button).toHaveStyle({ width: 44, height: 44 });
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });

    it('shows the badge dot only when asked', async () => {
      await renderThemed(
        <IconButton icon={Check} accessibilityLabel="Alerts" badge testID="alerts" />,
        scheme,
      );
      expect(screen.getByTestId('alerts-badge')).toHaveStyle({ backgroundColor: colors.danger });
    });

    it('has no badge by default', async () => {
      await renderThemed(
        <IconButton icon={Check} accessibilityLabel="Alerts" testID="alerts" />,
        scheme,
      );
      expect(screen.queryByTestId('alerts-badge')).toBeNull();
    });

    it('is disabled when asked', async () => {
      await renderThemed(<IconButton icon={Check} accessibilityLabel="Alerts" disabled />, scheme);
      expect(screen.getByRole('button', { name: 'Alerts' })).toBeDisabled();
    });
  });

  describe('Input', () => {
    it('is labelled and reports typed text', async () => {
      const onChangeText = jest.fn();
      await renderThemed(<Input label="Title" onChangeText={onChangeText} />, scheme);
      const field = screen.getByLabelText('Title');
      await fireEvent.changeText(field, 'Buy milk');
      expect(onChangeText).toHaveBeenCalledWith('Buy milk');
    });

    it('uses the focus border, then returns to the resting border', async () => {
      await renderThemed(<Input label="Title" />, scheme);
      const field = screen.getByLabelText('Title');
      expect(field).toHaveStyle({ borderColor: colors.borderStrong, minHeight: 52 });
      await fireEvent(field, 'focus');
      expect(field).toHaveStyle({ borderColor: colors.accent, borderWidth: 1.5 });
      await fireEvent(field, 'blur');
      expect(field).toHaveStyle({ borderColor: colors.borderStrong });
    });

    it('shows an error below the field, in the danger colour, and exposes it as a hint', async () => {
      await renderThemed(<Input label="Title" error="Enter a title." />, scheme);
      expect(screen.getByText('Enter a title.')).toBeTruthy();
      const field = screen.getByLabelText('Title');
      expect(field).toHaveStyle({ borderColor: colors.danger });
      expect(field.props.accessibilityHint).toBe('Enter a title.');
    });

    it('can be disabled', async () => {
      await renderThemed(<Input label="Title" editable={false} />, scheme);
      expect(screen.getByLabelText('Title').props.editable).toBe(false);
    });

    it('limits OS font scaling to the body cap', async () => {
      await renderThemed(<Input label="Title" />, scheme);
      const field = screen.getByLabelText('Title');
      expect(field.props.allowFontScaling).toBe(true);
      expect(field.props.maxFontSizeMultiplier).toBe(typography.body.maxFontSizeMultiplier);
    });
  });

  describe('Chip', () => {
    it('is a button with selected state', async () => {
      const onPress = jest.fn();
      await renderThemed(<Chip label="Errands" selected onPress={onPress} />, scheme);
      const chip = screen.getByRole('button', { name: 'Errands' });
      expect(chip).toBeSelected();
      await fireEvent.press(chip);
      expect(onPress).toHaveBeenCalled();
    });

    it('is not selected by default', async () => {
      await renderThemed(<Chip label="Errands" onPress={() => undefined} />, scheme);
      expect(screen.getByRole('button', { name: 'Errands' })).not.toBeSelected();
    });

    it('has a labelled remove button', async () => {
      const onRemove = jest.fn();
      await renderThemed(<Chip label="Errands" onRemove={onRemove} />, scheme);
      await fireEvent.press(screen.getByRole('button', { name: 'Remove Errands' }));
      expect(onRemove).toHaveBeenCalled();
    });

    it('is plain text when it has no handler', async () => {
      await renderThemed(<Chip label="Info" />, scheme);
      expect(screen.queryByRole('button', { name: 'Info' })).toBeNull();
      expect(screen.getByText('Info')).toBeTruthy();
    });
  });

  describe('Checkbox', () => {
    beforeEach(() => setHapticsEnabled(true));

    function Harness({
      initial = false,
      priority,
    }: {
      initial?: boolean;
      priority?: 0 | 1 | 2 | 3 | 4;
    }) {
      const [checked, setChecked] = useState(initial);
      return (
        <Checkbox
          checked={checked}
          onChange={setChecked}
          priority={priority}
          accessibilityLabel="Submit report"
        />
      );
    }

    it('is a checkbox that toggles and reports its state', async () => {
      await renderThemed(<Harness />, scheme);
      const box = screen.getByRole('checkbox', { name: 'Submit report' });
      expect(box).not.toBeChecked();
      await fireEvent.press(box);
      expect(screen.getByRole('checkbox', { name: 'Submit report' })).toBeChecked();
      await fireEvent.press(screen.getByRole('checkbox', { name: 'Submit report' }));
      expect(screen.getByRole('checkbox', { name: 'Submit report' })).not.toBeChecked();
    });

    it('has a 44 point hit area', async () => {
      await renderThemed(<Harness />, scheme);
      expect(screen.getByRole('checkbox')).toHaveStyle({ width: 44, height: 44 });
    });

    it.each([0, 1, 2, 3, 4] as const)(
      'priority %i ring uses its priority colour',
      async (level) => {
        await renderThemed(
          <Checkbox checked={false} priority={level} accessibilityLabel="Task" testID="box" />,
          scheme,
        );
        // The ring's border colour is the task's priority colour (none uses borderStrong).
        expect(JSON.stringify(screen.toJSON())).toContain(JSON.stringify(colors.priority[level]));
      },
    );

    it('fires a success haptic when checked and a light one when unchecked', async () => {
      const success = jest.spyOn(haptics, 'success');
      const light = jest.spyOn(haptics, 'light');
      await renderThemed(<Harness />, scheme);
      await fireEvent.press(screen.getByRole('checkbox'));
      expect(success).toHaveBeenCalledTimes(1);
      await fireEvent.press(screen.getByRole('checkbox'));
      expect(light).toHaveBeenCalledTimes(1);
      success.mockRestore();
      light.mockRestore();
    });

    it('does not fire when disabled', async () => {
      const onChange = jest.fn();
      await renderThemed(
        <Checkbox checked={false} onChange={onChange} disabled accessibilityLabel="Task" />,
        scheme,
      );
      await fireEvent.press(screen.getByRole('checkbox'));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('uses an 18 point ring for subtasks', async () => {
      await renderThemed(
        <Checkbox checked={false} size="subtask" accessibilityLabel="Subtask" />,
        scheme,
      );
      expect(JSON.stringify(screen.toJSON())).toContain('"width":18');
    });
  });

  describe('SegmentedControl', () => {
    const options = [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ] as const;

    it('is a named radio group with the selected option marked', async () => {
      await renderThemed(
        <SegmentedControl
          accessibilityLabel="Theme"
          options={options}
          value="light"
          onChange={() => undefined}
        />,
        scheme,
      );
      // The container is deliberately not "accessible" (that would hide the radios inside it), so
      // it is found by label rather than by role.
      expect(screen.getByLabelText('Theme').props.accessibilityRole).toBe('radiogroup');
      expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
    });

    it('reports the chosen value', async () => {
      const onChange = jest.fn();
      await renderThemed(
        <SegmentedControl
          accessibilityLabel="Theme"
          options={options}
          value="light"
          onChange={onChange}
        />,
        scheme,
      );
      await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }));
      expect(onChange).toHaveBeenCalledWith('dark');
    });
  });

  describe('Switch', () => {
    it('is a switch with a label and a checked state', async () => {
      const onValueChange = jest.fn();
      await renderThemed(
        <Switch value accessibilityLabel="Daily summary" onValueChange={onValueChange} />,
        scheme,
      );
      const control = screen.getByRole('switch', { name: 'Daily summary' });
      expect(control).toBeChecked();
      await fireEvent(control, 'valueChange', false);
      expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it('can be disabled', async () => {
      await renderThemed(
        <Switch value={false} disabled accessibilityLabel="Sync" onValueChange={() => undefined} />,
        scheme,
      );
      expect(screen.getByRole('switch', { name: 'Sync' })).toBeDisabled();
    });
  });

  describe('Slider', () => {
    it('is adjustable with a label and exposes its range and value', async () => {
      await renderThemed(
        <Slider value={0.4} accessibilityLabel="Daily target" onValueChange={() => undefined} />,
        scheme,
      );
      const slider = screen.getByLabelText('Daily target');
      expect(slider.props.accessibilityRole).toBe('adjustable');
      expect(slider.props.accessibilityValue).toEqual({ min: 0, max: 1, now: 0.4 });
    });
  });

  describe('Menu', () => {
    it('passes its items to the native menu and reports the selected id', async () => {
      const onSelect = jest.fn();
      await renderThemed(
        <Menu
          testID="menu"
          items={[
            { id: 'edit', title: 'Edit' },
            { id: 'delete', title: 'Delete', destructive: true },
          ]}
          onSelect={onSelect}
        >
          <IconButton icon={Check} accessibilityLabel="More actions" />
        </Menu>,
        scheme,
      );
      expect(screen.getByRole('button', { name: 'More actions' })).toBeTruthy();
      const native = screen.getByTestId('menu');
      expect(native.props.actions).toEqual([
        { id: 'edit', title: 'Edit', attributes: { destructive: undefined, disabled: undefined } },
        { id: 'delete', title: 'Delete', attributes: { destructive: true, disabled: undefined } },
      ]);
      await fireEvent(native, 'pressAction', { nativeEvent: { event: 'delete' } });
      expect(onSelect).toHaveBeenCalledWith('delete');
    });
  });

  describe('Dialog', () => {
    it('shows its title, message and both actions', async () => {
      await renderThemed(
        <Dialog
          visible
          title="Delete this task?"
          message="You can undo this."
          confirmLabel="Delete task"
          onConfirm={() => undefined}
          onCancel={() => undefined}
        />,
        scheme,
      );
      expect(screen.getByRole('header', { name: 'Delete this task?' })).toBeTruthy();
      expect(screen.getByText('You can undo this.')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Delete task' })).toBeTruthy();
      expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThan(0);
    });

    it('confirms with a warning haptic when destructive', async () => {
      const warning = jest.spyOn(haptics, 'warning');
      const onConfirm = jest.fn();
      await renderThemed(
        <Dialog
          visible
          title="Delete?"
          confirmLabel="Delete"
          onConfirm={onConfirm}
          onCancel={() => undefined}
        />,
        scheme,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
      expect(onConfirm).toHaveBeenCalled();
      expect(warning).toHaveBeenCalled();
      warning.mockRestore();
    });

    it('cancels from the Cancel button', async () => {
      const onCancel = jest.fn();
      await renderThemed(
        <Dialog
          visible
          title="Delete?"
          confirmLabel="Delete"
          onConfirm={() => undefined}
          onCancel={onCancel}
        />,
        scheme,
      );
      await fireEvent.press(screen.getAllByRole('button', { name: 'Cancel' })[0]!);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('cancels on the Android back button (the modal asks to close)', async () => {
      const onCancel = jest.fn();
      await renderThemed(
        <Dialog
          visible
          title="Delete?"
          confirmLabel="Delete"
          onConfirm={() => undefined}
          onCancel={onCancel}
        />,
        scheme,
      );
      // Events bubble up to the nearest handler, which is the Modal's onRequestClose.
      await fireEvent(screen.getByText('Delete?'), 'requestClose');
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('renders nothing when hidden', async () => {
      await renderThemed(
        <Dialog
          visible={false}
          title="Delete?"
          confirmLabel="Delete"
          onConfirm={() => undefined}
          onCancel={() => undefined}
        />,
        scheme,
      );
      expect(screen.queryByText('Delete?')).toBeNull();
    });
  });

  describe('Sheet', () => {
    it('renders its title as a header with its content', async () => {
      await renderThemed(
        <Sheet visible onClose={() => undefined} title="Sort by">
          <Button label="Due date" />
        </Sheet>,
        scheme,
      );
      expect(screen.getByRole('header', { name: 'Sort by' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Due date' })).toBeTruthy();
    });
  });

  describe('Snackbar', () => {
    function Trigger({ onAction }: { onAction: () => void }) {
      const snackbar = useSnackbar();
      return (
        <>
          <Button
            label="first"
            onPress={() =>
              snackbar.show({ message: 'Task completed', actionLabel: 'Undo', onAction })
            }
          />
          <Button label="second" onPress={() => snackbar.show({ message: 'Task deleted' })} />
        </>
      );
    }

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('shows a message with one action that runs and dismisses', async () => {
      const onAction = jest.fn();
      await renderThemed(
        <SnackbarProvider>
          <Trigger onAction={onAction} />
        </SnackbarProvider>,
        scheme,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'first' }));
      expect(screen.getByText('Task completed')).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Task completed')).toBeNull();
    });

    it('dismisses itself after 5 seconds', async () => {
      await renderThemed(
        <SnackbarProvider>
          <Trigger onAction={() => undefined} />
        </SnackbarProvider>,
        scheme,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'first' }));
      await act(async () => jest.advanceTimersByTime(4900));
      expect(screen.getByText('Task completed')).toBeTruthy();
      await act(async () => jest.advanceTimersByTime(200));
      expect(screen.queryByText('Task completed')).toBeNull();
    });

    it('shows one at a time: a new message replaces the old one', async () => {
      await renderThemed(
        <SnackbarProvider>
          <Trigger onAction={() => undefined} />
        </SnackbarProvider>,
        scheme,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'first' }));
      await fireEvent.press(screen.getByRole('button', { name: 'second' }));
      expect(screen.queryByText('Task completed')).toBeNull();
      expect(screen.getByText('Task deleted')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    });

    it('useSnackbar throws outside its provider', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(renderThemed(<Trigger onAction={() => undefined} />, scheme)).rejects.toThrow(
        'useSnackbar must be used inside <SnackbarProvider>',
      );
    });
  });
});
