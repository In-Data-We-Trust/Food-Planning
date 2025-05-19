const mongoose = require('mongoose');

const storeProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store is required']
    },
    storeProductId: {
      type: String,
      required: [true, 'Store product ID is required']
    },
    category: {
      type: String,
      required: [true, 'Product category is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required']
    },
    imageUrl: String,
    availableForDelivery: {
      type: Boolean,
      default: true
    },
    availableForPickup: {
      type: Boolean,
      default: true
    },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number
    },
    packageSize: String,
    ingredients: String,
    allergens: [String],
    organic: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
storeProductSchema.index({ store: 1, storeProductId: 1 }, { unique: true });
storeProductSchema.index({ name: 'text' });
storeProductSchema.index({ category: 1, store: 1 });

const StoreProduct = mongoose.model('StoreProduct', storeProductSchema);

module.exports = StoreProduct;
