import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Category } from '../../models/Event';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onChange: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onChange,
}) => {
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Категория
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => onChange(category.id)}
            color={selectedCategory === category.id ? 'primary' : 'default'}
            variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            sx={{
              borderRadius: 2,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CategorySelector;
