import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Box, 
  Chip, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, startOfWeek } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

import RecipeCard from '../components/RecipeCard';
import MealTypeSelector from '../components/MealTypeSelector';
import ErrorAlert from '../components/ErrorAlert';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MealPlanningPage = () => {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [mealPlanData, setMealPlanData] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [recipesDialogOpen, setRecipesDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  
  // Query for meal plan data
  const { data: mealPlan, isLoading: isMealPlanLoading, error: mealPlanError } = useQuery(
    ['mealPlan', startDate],
    async () => {
      const response = await axios.get('/api/meal-plans/current', {
        params: { startDate: format(startDate, 'yyyy-MM-dd') }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        setMealPlanData(data);
      },
      enabled: !isCreatingPlan
    }
  );
  
  // Query for recipes
  const { data: recipes, isLoading: isRecipesLoading } = useQuery(
    ['recipes', searchTerm, dietaryFilter],
    async () => {
      const response = await axios.get('/api/recipes', {
        params: { 
          search: searchTerm,
          dietaryLabels: dietaryFilter || undefined
        }
      });
      return response.data;
    },
    {
      enabled: recipesDialogOpen
    }
  );
  
  // Mutation for creating a meal plan
  const createMealPlanMutation = useMutation(
    (newPlan) => axios.post('/api/meal-plans', newPlan),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mealPlan']);
        setIsCreatingPlan(false);
      }
    }
  );
  
  // Mutation for updating meal plan
  const updateMealPlanMutation = useMutation(
    (updatedPlan) => axios.patch(`/api/meal-plans/${mealPlanData._id}`, updatedPlan),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mealPlan']);
      }
    }
  );
  
  // Generate days array for the week
  const days = [...Array(7)].map((_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      dateString: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'EEE, MMM d')
    };
  });
  
  // Initialize empty week if no meal plan exists
  useEffect(() => {
    if (!isMealPlanLoading && !mealPlan && !isCreatingPlan) {
      const emptyWeek = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(addDays(startDate, 6), 'yyyy-MM-dd'),
        days: days.map(day => ({
          date: day.dateString,
          meals: mealTypes.map(type => ({
            type,
            recipes: []
          }))
        }))
      };
      setMealPlanData(emptyWeek);
    }
  }, [isMealPlanLoading, mealPlan, startDate, isCreatingPlan]);
  
  const handleCreateMealPlan = () => {
    setIsCreatingPlan(true);
    createMealPlanMutation.mutate(mealPlanData);
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Clone current meal plan data
    const newMealPlanData = { ...mealPlanData };
    
    // Parse the droppableIds to get day and meal indexes
    const [sourceDayIndex, sourceMealType] = source.droppableId.split('-');
    const [destDayIndex, destMealType] = destination.droppableId.split('-');
    
    // Find the relevant day and meal objects
    const sourceDay = newMealPlanData.days[parseInt(sourceDayIndex)];
    const destDay = newMealPlanData.days[parseInt(destDayIndex)];
    const sourceMeal = sourceDay.meals.find(m => m.type === sourceMealType);
    const destMeal = destDay.meals.find(m => m.type === destMealType);
    
    // Move the recipe
    const [movedRecipe] = sourceMeal.recipes.splice(source.index, 1);
    destMeal.recipes.splice(destination.index, 0, movedRecipe);
    
    // Update state
    setMealPlanData(newMealPlanData);
    
    // If we have an existing meal plan, update it
    if (mealPlanData._id) {
      updateMealPlanMutation.mutate(newMealPlanData);
    }
  };
  
  const handleOpenRecipesDialog = (dayIndex, mealType) => {
    setSelectedDay(dayIndex);
    setSelectedMealType(mealType);
    setRecipesDialogOpen(true);
  };
  
  const handleAddRecipeToMeal = (recipe) => {
    // Clone current meal plan data
    const newMealPlanData = { ...mealPlanData };
    
    // Find the relevant day and meal objects
    const day = newMealPlanData.days[selectedDay];
    const meal = day.meals.find(m => m.type === selectedMealType);
    
    // Add the recipe
    meal.recipes.push({
      recipe: recipe._id,
      servings: 1,
      notes: '',
      recipeDetails: recipe // Store full recipe details for UI
    });
    
    // Update state
    setMealPlanData(newMealPlanData);
    
    // If we have an existing meal plan, update it
    if (mealPlanData._id) {
      updateMealPlanMutation.mutate(newMealPlanData);
    }
    
    setRecipesDialogOpen(false);
  };
  
  const handleRemoveRecipe = (dayIndex, mealType, recipeIndex) => {
    // Clone current meal plan data
    const newMealPlanData = { ...mealPlanData };
    
    // Find the relevant day and meal objects
    const day = newMealPlanData.days[dayIndex];
    const meal = day.meals.find(m => m.type === mealType);
    
    // Remove the recipe
    meal.recipes.splice(recipeIndex, 1);
    
    // Update state
    setMealPlanData(newMealPlanData);
    
    // If we have an existing meal plan, update it
    if (mealPlanData._id) {
      updateMealPlanMutation.mutate(newMealPlanData);
    }
  };
  
  if (isMealPlanLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (mealPlanError) {
    return <ErrorAlert message="Error loading meal plan data" />;
  }
  
  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meal Planning
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Week Starting"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          <Button 
            variant="contained" 
            color="primary"
            disabled={isCreatingPlan || !!mealPlanData?._id}
            onClick={handleCreateMealPlan}
          >
            {isCreatingPlan ? <CircularProgress size={24} /> : 'Save Meal Plan'}
          </Button>
        </Box>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={3}>
            {days.map((day, dayIndex) => (
              <Grid item xs={12} md={6} lg={4} xl={12/7} key={day.dateString}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {day.displayDate}
                  </Typography>
                  
                  {mealTypes.map((mealType) => {
                    // Find the meal data for this day and meal type
                    const dayData = mealPlanData?.days[dayIndex];
                    const mealData = dayData?.meals.find(m => m.type === mealType);
                    
                    return (
                      <Box key={`${dayIndex}-${mealType}`} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1">{mealType}</Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleOpenRecipesDialog(dayIndex, mealType)}
                          >
                            Add Recipe
                          </Button>
                        </Box>
                        
                        <Droppable droppableId={`${dayIndex}-${mealType}`}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{ 
                                minHeight: 100, 
                                bgcolor: 'grey.100', 
                                borderRadius: 1,
                                p: 1
                              }}
                            >
                              {mealData?.recipes.map((recipeItem, index) => (
                                <Draggable 
                                  key={`${recipeItem.recipe}-${index}`} 
                                  draggableId={`${dayIndex}-${mealType}-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{ mb: 1 }}
                                    >
                                      <RecipeCard 
                                        recipe={recipeItem.recipeDetails || { name: 'Loading...' }}
                                        servings={recipeItem.servings}
                                        onDelete={() => handleRemoveRecipe(dayIndex, mealType, index)}
                                        compact
                                      />
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      </Box>
      
      {/* Recipe Selection Dialog */}
      <Dialog 
        open={recipesDialogOpen} 
        onClose={() => setRecipesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Recipe</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" mb={3}>
            <TextField
              label="Search Recipes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mr: 2 }}
            />
            
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Dietary Preference</InputLabel>
              <Select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                label="Dietary Preference"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                <MenuItem value="Vegan">Vegan</MenuItem>
                <MenuItem value="Gluten-Free">Gluten-Free</MenuItem>
                <MenuItem value="Dairy-Free">Dairy-Free</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {isRecipesLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {recipes?.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <RecipeCard 
                    recipe={recipe}
                    onClick={() => handleAddRecipeToMeal(recipe)}
                    actionLabel="Add to Plan"
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipesDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MealPlanningPage;
