import React from 'react';

// Props interface defines what data the component needs
interface FilterChipProps {
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
        >
            {label}
        </button>
    );
};

