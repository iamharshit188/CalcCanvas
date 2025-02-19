// src/components/InfoModal.tsx
import { Modal, Text, List } from '@mantine/core';

interface InfoModalProps {
    opened: boolean;
    onClose: () => void;
}

export function InfoModal({ opened, onClose }: InfoModalProps) {
    return (
        <Modal 
            opened={opened} 
            onClose={onClose}
            title="How to Use Math Canvas"
            size="lg"
        >
            <Text size="sm" mb="md">
                This is an interactive mathematical canvas that helps you solve equations and mathematical expressions. Here's how to use it:
            </Text>
            <List>
                <List.Item>
                    <strong>Writing Equations:</strong> Simply draw your mathematical equation on the canvas. Write clearly and leave space between numbers and operators.
                </List.Item>
                <List.Item>
                    <strong>Variable Assignment:</strong> You can assign values to variables by writing expressions like "x = 5". These assignments will be remembered for subsequent calculations.
                </List.Item>
                <List.Item>
                    <strong>Solving Equations:</strong> Write a complete equation (e.g., "2x + 3 = 7") and click the "Run" button to solve it.
                </List.Item>
                <List.Item>
                    <strong>Tools Available:</strong>
                    <List withPadding>
                        <List.Item>Use the color swatches to change pen color</List.Item>
                        <List.Item>Toggle between Eraser and Drawing mode</List.Item>
                        <List.Item>Use the Reset button to clear the canvas</List.Item>
                        <List.Item>Switch between Dark and Light mode as needed</List.Item>
                    </List>
                </List.Item>
                <List.Item>
                    <strong>Results:</strong> After clicking Run, the solution will appear as a draggable LaTeX expression that you can move around the canvas.
                </List.Item>
                <List.Item>
                    <strong>Keyboard Shortcuts:</strong>
                    <List withPadding>
                        <List.Item>Ctrl + Z: Undo last action</List.Item>
                        <List.Item>Ctrl + R: Redo last action</List.Item>
                        <List.Item>1: Reset canvas</List.Item>
                        <List.Item>2: Toggle eraser</List.Item>
                        <List.Item>3: Toggle dark mode</List.Item>
                        <List.Item>4-7: Select colors</List.Item>
                        <List.Item>8: Open this help menu</List.Item>
                        <List.Item>9: Run calculation</List.Item>
                    </List>
                </List.Item>
            </List>
            <Text size="sm" mt="md" color="dimmed">
                Tip: For best results, write your equations clearly and avoid overlapping characters. Hover over any button to see its keyboard shortcut.
            </Text>
        </Modal>
    );
}
