import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { ThemedText } from './ThemedText';

type PillInputProps = {
    label: string;
    placeholder: string;
    selectedItems: string[];
    onSetSelectedItems: (items: string[]) => void;
    suggestedItems: string[];
    onSetSuggestedItems: (items: string[]) => void;
    editable?: boolean;
};

const PillInput: React.FC<PillInputProps> = ({
    label,
    placeholder,
    selectedItems,
    onSetSelectedItems,
    suggestedItems,
    onSetSuggestedItems,
    editable = true,
}) => {
    const [currentInput, setCurrentInput] = useState('');

    const handleAddItemFromInput = () => {
        const newItem = currentInput.trim();
        if (newItem && !selectedItems.includes(newItem)) {
            onSetSelectedItems([...selectedItems, newItem]);
        }
        setCurrentInput('');
    };

    const handleRemoveItem = (itemToRemove: string) => {
        if (!editable) return;
        onSetSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    };

    const handleAddSuggestedItem = (itemToAdd: string) => {
        if (!editable) return;
        if (itemToAdd && !selectedItems.includes(itemToAdd)) {
            onSetSelectedItems([...selectedItems, itemToAdd]);
        }
        onSetSuggestedItems(suggestedItems.filter(item => item !== itemToAdd));
    };

    return (
        <View style={styles.pillInputWrapper}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <View style={styles.textInputContainer}>
                <TextInput
                    style={[styles.input, styles.textInputTheme, styles.pillTextInputStyle]}
                    value={currentInput}
                    onChangeText={setCurrentInput}
                    placeholder={placeholder}
                    placeholderTextColor="#aaa"
                    onSubmitEditing={handleAddItemFromInput}
                    editable={true}
                />
            </View>

            {selectedItems.length > 0 && (
                <ScrollView
                    horizontal={false}
                    contentContainerStyle={styles.itemsContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {selectedItems.map((item, index) => (
                        <View key={`selected-${label.toLowerCase().replace(/\s+/g, '-')}-${item}-${index}`} style={styles.itemPill}>
                            <ThemedText style={styles.itemText}>{item}</ThemedText>
                            {editable && (
                                <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.removeItemButton}>
                                    <ThemedText style={styles.removeItemText}>✕</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {suggestedItems.length > 0 && (
                <View style={styles.suggestedItemsSection}>
                    <ThemedText style={styles.suggestedItemsTitle}>Suggested (Tap to add):</ThemedText>
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={styles.itemsContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        {suggestedItems.map((item, index) => (
                            <TouchableOpacity
                                key={`suggested-${label.toLowerCase().replace(/\s+/g, '-')}-${item}-${index}`}
                                onPress={() => handleAddSuggestedItem(item)}
                                style={styles.suggestedItemPill}
                                disabled={!editable}
                            >
                                <ThemedText style={styles.suggestedItemText}>{item}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    pillInputWrapper: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        marginTop: 10,
    },
    textInputContainer: {},
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 16,
        marginBottom: 12,
    },
    textInputTheme: {
        color: Platform.OS === 'ios' ? '#000000' : '#000000',
        backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF',
    },
    pillTextInputStyle: {
        marginBottom: 8,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 4,
        alignItems: 'flex-start',
    },
    itemPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    itemText: {
        fontSize: 14,
        color: '#333',
        marginRight: 6,
    },
    removeItemButton: {
        marginLeft: 4,
        padding: 2,
    },
    removeItemText: {
        color: '#555',
        fontSize: 14,
        fontWeight: 'bold',
    },
    suggestedItemsSection: {
        marginTop: 10,
    },
    suggestedItemsTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    suggestedItemPill: {
        backgroundColor: '#D6EAF8',
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    suggestedItemText: {
        fontSize: 14,
        color: '#2471A3',
    },
});

export default PillInput;
