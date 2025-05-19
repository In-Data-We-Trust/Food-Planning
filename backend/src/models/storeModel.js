const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    chain: {
      type: String,
      required: [true, 'Store chain is required'],
      trim: true
    },
    apiKey: {
      type: String,
      required: function() {
        return this.hasApi === true;
      },
      select: false
    },
    hasApi: {
      type: Boolean,
      default: false
    },
    apiEndpoint: {
      type: String,
      required: function() {
        return this.hasApi === true;
      }
    },
    logo: String,
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    categories: [String],
    deliveryAvailable: {
      type: Boolean,
      default: false
    },
    pickupAvailable: {
      type: Boolean,
      default: false
    },
    deliveryFee: Number,
    minimumOrder: Number,
    operatingHours: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false
        }
      }
    ],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
storeSchema.index({ chain: 1, name: 1 }, { unique: true });
storeSchema.index({ 'location.coordinates': '2dsphere' });

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
