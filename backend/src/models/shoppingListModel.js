const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A shopping list must belong to a user']
    },
    name: {
      type: String,
      default: function() {
        return `Shopping List - ${new Date().toLocaleDateString()}`;
      }
    },
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealPlan'
    },
    items: [
      {
        ingredient: {
          name: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          unit: {
            type: String,
            required: true
          },
          section: {
            type: String,
            default: 'Other'
          }
        },
        recipe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
        },
        isChecked: {
          type: Boolean,
          default: false
        },
        notes: String,
        addedBy: {
          type: String,
          enum: ['user', 'system'],
          default: 'system'
        }
      }
    ],
    sections: [
      {
        name: String,
        order: Number
      }
    ],
    store: {
      type: String,
      default: 'Default Store'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date
  },
  {
    timestamps: true
  }
);

// Method to add an item to the shopping list
shoppingListSchema.methods.addItem = function(item) {
  // Check if item already exists to avoid duplicates
  const existingItemIndex = this.items.findIndex(
    existingItem => 
      existingItem.ingredient.name.toLowerCase() === item.ingredient.name.toLowerCase() &&
      existingItem.ingredient.unit === item.ingredient.unit
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    this.items[existingItemIndex].ingredient.quantity += item.ingredient.quantity;
  } else {
    // Add new item if it doesn't exist
    this.items.push(item);
  }
  
  return this.save();
};

// Method to generate a shopping list from a meal plan
shoppingListSchema.statics.generateFromMealPlan = async function(mealPlanId, userId) {
  // This would contain logic to:
  // 1. Fetch the meal plan and populate recipes
  // 2. Extract all ingredients from the recipes
  // 3. Consolidate similar ingredients
  // 4. Create a new shopping list with the consolidated ingredients
  
  // Implementation would go here
};

// Indexes for faster queries
shoppingListSchema.index({ user: 1, createdAt: -1 });
shoppingListSchema.index({ mealPlan: 1 });

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;
