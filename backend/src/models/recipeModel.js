const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A recipe must have a name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    prepTime: {
      type: Number, // in minutes
      required: [true, 'Preparation time is required']
    },
    cookTime: {
      type: Number, // in minutes
      required: [true, 'Cooking time is required']
    },
    servings: {
      type: Number,
      required: [true, 'Number of servings is required']
    },
    ingredients: [
      {
        name: {
          type: String,
          required: [true, 'Ingredient name is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Ingredient quantity is required']
        },
        unit: {
          type: String,
          required: [true, 'Ingredient unit is required']
        },
        section: {
          type: String, // For grouping in shopping list (produce, dairy, etc.)
          default: 'Other'
        },
        notes: {
          type: String,
          default: ''
        },
        optional: {
          type: Boolean,
          default: false
        },
        substitute: {
          type: String,
          default: ''
        }
      }
    ],
    instructions: [
      {
        step: Number,
        text: String,
        notes: {
          type: String,
          default: ''
        }
      }
    ],
    nutrition: {
      calories: Number,
      protein: Number, // in grams
      carbs: Number, // in grams
      fat: Number, // in grams
      fiber: Number, // in grams
      sugar: Number // in grams
    },
    category: {
      type: [String],
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Drink', 'Other'],
      default: ['Other']
    },
    cuisine: {
      type: String,
      enum: ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'French', 'American', 'Mediterranean', 'Thai', 'Other'],
      default: 'Other'
    },
    dietaryLabels: {
      type: [String],
      enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein', 'None'],
      default: ['None']
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    sourceUrl: {
      type: String,
      validate: {
        validator: function(v) {
          // Basic URL validation
          return v === '' || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    imageUrl: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A recipe must belong to a user']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    personalNotes: {
      type: String,
      default: ''
    },
    cookingTips: {
      type: String,
      default: ''
    },
    variations: [
      {
        name: String,
        description: String,
        ingredientChanges: [
          {
            original: String,
            replacement: String
          }
        ],
        instructionChanges: [
          {
            step: Number,
            newInstruction: String
          }
        ]
      }
    ],
    tags: [String],
    favorites: {
      type: Number,
      default: 0
    },
    seasonality: {
      type: [String],
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'Year-Round'],
      default: ['Year-Round']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Indexes for faster queries
recipeSchema.index({ name: 'text', description: 'text' });
recipeSchema.index({ createdBy: 1, category: 1 });
recipeSchema.index({ isPublic: 1, cuisine: 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
