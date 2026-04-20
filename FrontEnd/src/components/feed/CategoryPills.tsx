import React from 'react';
import { cn } from '../../lib/utils';
import { LayoutGrid, Smartphone, Car, Home, Sofa, Tv } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'phones', label: 'Phones', icon: Smartphone },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'houses', label: 'Houses', icon: Home },
  { id: 'furniture', label: 'Furniture', icon: Sofa },
  { id: 'electronics', label: 'Electronics', icon: Tv },
];

interface CategoryPillsProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex overflow-x-auto gap-3 pb-4 pt-2 px-4 snap-x hide-scrollbar">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id;
        
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all border snap-start font-medium text-sm shadow-sm",
              isSelected 
                ? "bg-gray-900 border-gray-900 text-white" 
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon size={16} className={cn(isSelected ? "text-white" : "text-gray-500")} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
