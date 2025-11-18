import React from 'react';

interface FilterChipProps {
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            // 1. 'border' is in base classes to prevent layout shift
            // 2. Border COLOR changes based on state
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap border ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary' // Active: Border matches Background (Indigo)
                    : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground' // Inactive: Gray border
                }`}
        >
            {label}
        </button>
    );
};