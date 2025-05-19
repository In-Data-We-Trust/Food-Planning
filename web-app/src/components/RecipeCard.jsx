import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, IconButton, Chip, Tooltip } from '@mui/material';
import { Delete, Edit, AccessTime, Restaurant, Star } from '@mui/icons-material';

const RecipeCard = ({ 
  recipe, 
  servings = null,
  compact = false,
  onClick = null,
  onDelete = null,
  onEdit = null,
  actionLabel = 'View Recipe'
}) => {
  const handleCardClick = () => {
    if (onClick) onClick(recipe);
  };

  return (
    <Card 
      elevation={compact ? 1 : 3} 
      sx={{ 
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        height: compact ? 80 : 'auto',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {}
      }}
      onClick={onClick ? handleCardClick : undefined}
    >
      {recipe.imageUrl && (
        <CardMedia
          component="img"
          image={recipe.imageUrl}
          alt={recipe.name}
          sx={{ 
            height: compact ? 80 : 140, 
            width: compact ? 80 : '100%'
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, p: compact ? 1 : 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography 
            variant={compact ? "body1" : "h6"} 
            component="h2" 
            fontWeight="bold"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: compact ? 1 : 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {recipe.name}
          </Typography>
          
          {onDelete && (
            <IconButton 
              size="small" 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
              sx={{ ml: 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        {!compact && (
          <>
            <Box display="flex" alignItems="center" mt={1} mb={1}>
              {recipe.totalTime && (
                <Tooltip title="Total time">
                  <Box display="flex" alignItems="center" mr={2}>
                    <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.totalTime} min
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {recipe.servings && (
                <Tooltip title="Servings">
                  <Box display="flex" alignItems="center" mr={2}>
                    <Restaurant fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.servings}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {recipe.rating > 0 && (
                <Tooltip title="Rating">
                  <Box display="flex" alignItems="center">
                    <Star fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
            
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
              {recipe.cuisine && recipe.cuisine !== 'Other' && (
                <Chip 
                  label={recipe.cuisine} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              )}
              
              {recipe.dietaryLabels && recipe.dietaryLabels.map(label => (
                label !== 'None' && (
                  <Chip 
                    key={label} 
                    label={label} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                  />
                )
              ))}
            </Box>
          </>
        )}
        
        {compact && servings && (
          <Typography variant="body2" color="text.secondary">
            Servings: {servings}
          </Typography>
        )}
        
        {!compact && !onClick && onEdit && (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<Edit />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
            >
              Edit Recipe
            </Button>
          </Box>
        )}
        
        {!compact && onClick && (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={handleCardClick}
            >
              {actionLabel}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
