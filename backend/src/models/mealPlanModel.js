const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A meal plan must belong to a user']
    },
    name: {
      type: String,
      default: function() {
        return `Meal Plan - ${new Date().toLocaleDateString()}`;
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    days: [
      {
        date: {
          type: Date,
          required: true
        },
        meals: [
          {
            type: {
              type: String,
              enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
              required: true
            },
            recipes: [
              {
                recipe: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Recipe',
                  required: true
                },
                servings: {
                  type: Number,
                  default: 1
                },
                notes: String
              }
            ],
            notes: String
          }
        ],
        notes: String
      }
    ],
    nutritionTotals: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    templateName: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to calculate nutrition totals
mealPlanSchema.pre('save', async function(next) {
  // Logic to calculate nutrition totals would go here
  // This would involve populating recipes and summing nutrition values
  next();
});

// Virtual to calculate total number of recipes in plan
mealPlanSchema.virtual('recipeCount').get(function() {
  return this.days.reduce((total, day) => {
    return total + day.meals.reduce((mealTotal, meal) => {
      return mealTotal + meal.recipes.length;
    }, 0);
  }, 0);
});

// Indexes for faster queries
mealPlanSchema.index({ user: 1, startDate: -1 });
mealPlanSchema.index({ isTemplate: 1, user: 1 });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
