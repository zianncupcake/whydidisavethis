import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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
    const colorScheme = useColorScheme();

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
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>{label}</Text>
            <View style={styles.textInputContainer}>
                <TextInput
                    style={[
                        styles.input, 
                        styles.textInputTheme, 
                        styles.pillTextInputStyle,
                        { 
                            backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
                            borderColor: Colors[colorScheme ?? 'light'].border,
                            color: Colors[colorScheme ?? 'light'].text
                        }
                    ]}
                    value={currentInput}
                    onChangeText={setCurrentInput}
                    placeholder={placeholder}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
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
                        <View 
                            key={`selected-${label.toLowerCase().replace(/\s+/g, '-')}-${item}-${index}`} 
                            style={[styles.itemPill, { backgroundColor: Colors[colorScheme ?? 'light'].tagBackground }]}
                        >
                            <Text style={[styles.itemText, { color: Colors[colorScheme ?? 'light'].primary }]}>{item}</Text>
                            {editable && (
                                <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.removeItemButton}>
                                    <Text style={[styles.removeItemText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {suggestedItems.length > 0 && (
                <View style={styles.suggestedItemsSection}>
                    <Text style={[styles.suggestedItemsTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Suggested (Tap to add):</Text>
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={styles.itemsContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        {suggestedItems.map((item, index) => (
                            <TouchableOpacity
                                key={`suggested-${label.toLowerCase().replace(/\s+/g, '-')}-${item}-${index}`}
                                onPress={() => handleAddSuggestedItem(item)}
                                style={[
                                    styles.suggestedItemPill, 
                                    { 
                                        backgroundColor: Colors[colorScheme ?? 'light'].suggestedBackground,
                                        borderColor: Colors[colorScheme ?? 'light'].border
                                    }
                                ]}
                                disabled={!editable}
                            >
                                <Text style={[styles.suggestedItemText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{item}</Text>
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
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 8,
    },
    textInputContainer: {},
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        borderWidth: 1,
        marginBottom: 12,
    },
    textInputTheme: {
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
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    itemText: {
        fontSize: 13,
        marginRight: 6,
    },
    removeItemButton: {
        marginLeft: 4,
        padding: 2,
    },
    removeItemText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    suggestedItemsSection: {
        marginTop: 10,
    },
    suggestedItemsTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    suggestedItemPill: {
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    suggestedItemText: {
        fontSize: 13,
    },
});

export default PillInput;
