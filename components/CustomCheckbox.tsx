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
        height: 28,
        width: 28,
    },
    checkbox: {
        height: 24,
        width: 24,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: '#FFB6C1',
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        width: 14,
        height: 14,
        backgroundColor: '#FFB6C1',
        borderRadius: 2,
    },
});

export default CustomCheckbox;