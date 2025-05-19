const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An order must belong to a user']
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'An order must be associated with a store']
    },
    shoppingList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShoppingList'
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StoreProduct',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        notes: String,
        substitutionPreference: {
          type: String,
          enum: ['No Substitution', 'Similar Item', 'Any Substitution'],
          default: 'Similar Item'
        },
        isSubstitution: {
          type: Boolean,
          default: false
        },
        originalProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StoreProduct'
        }
      }
    ],
    orderType: {
      type: String,
      enum: ['Delivery', 'Pickup'],
      required: true
    },
    status: {
      type: String,
      enum: [
        'Draft', 
        'Pending', 
        'Processing', 
        'Ready for Pickup', 
        'Out for Delivery', 
        'Delivered', 
        'Picked Up', 
        'Cancelled', 
        'Failed'
      ],
      default: 'Draft'
    },
    scheduledDate: {
      type: Date,
      required: function() {
        return this.status !== 'Draft';
      }
    },
    scheduledTimeSlot: {
      start: String,
      end: String
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Store Account', 'Pay at Pickup'],
      required: function() {
        return this.status !== 'Draft';
      }
    },
    paymentDetails: {
      transactionId: String,
      last4: String,
      cardType: String
    },
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    tip: Number,
    discount: Number,
    total: Number,
    storeOrderId: String,
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      notes: String
    },
    deliveryInstructions: String,
    externalOrderStatus: String,
    externalOrderLink: String,
    refundAmount: Number,
    refundReason: String,
    notes: String
  },
  {
    timestamps: true
  }
);

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.subtotal = subtotal;
  this.tax = subtotal * 0.08; // Example tax calculation (8%)
  this.total = subtotal + this.tax + (this.deliveryFee || 0) + (this.tip || 0) - (this.discount || 0);
  
  return this.save();
};

// Method to submit order to store API
orderSchema.methods.submitToStoreApi = async function() {
  // Implementation would connect to store API based on the store's details
  // This is a placeholder for the actual implementation
  if (this.status !== 'Draft') {
    throw new Error('Only draft orders can be submitted');
  }
  
  try {
    // Example implementation - would be replaced with actual API call
    this.status = 'Pending';
    this.storeOrderId = 'STO-' + Date.now().toString();
    return await this.save();
  } catch (error) {
    this.status = 'Failed';
    await this.save();
    throw error;
  }
};

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ store: 1, status: 1 });
orderSchema.index({ storeOrderId: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
