import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

interface CustomCheckboxProps {
    checked: boolean;
    onPress: () => void;
    style?: ViewStyle;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onPress, style }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.container, style]}
        >
            <View style={styles.checkbox}>
                {checked && <View style={styles.checked} />}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        width: 24,
    },
    checkbox: {
        height: 20,
        width: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.checkboxBorder,
        backgroundColor: Colors.checkboxFill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        width: 12,
        height: 12,
        backgroundColor: Colors.checkboxCheck,
        borderRadius: 2,
    },
});

export default CustomCheckbox;