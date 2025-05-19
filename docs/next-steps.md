# Food Planning App - Next Steps Guide

## Project Setup

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd c:\Git\Food-Planning\backend

# Install dependencies
npm install

# Create .env file with environment variables
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-planning
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587" > .env

# Start development server
npm run dev
```

### 2. Web App Setup

```bash
# Navigate to the web app directory
cd c:\Git\Food-Planning\web-app

# Install dependencies
npm install

# Start development server
npm start
```

### 3. Mobile App Setup

```bash
# Navigate to the mobile app directory
cd c:\Git\Food-Planning\mobile-app

# Install dependencies
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..

# Start for Android
npm run android

# Start for iOS (Mac only)
npm run ios
```

## Development Priorities

Based on the requirements captured in the GitHub issue, focus development efforts on:

1. **Weekly Meal Planning UI**: 
   - Implement the drag-and-drop meal planning interface
   - Add custom notes capabilities to recipes and meal plan items

2. **Recipe Management**:
   - Support for storing recipe URLs
   - Custom modifications to recipes
   - Adjustable serving sizes

3. **Shopping List Generation**:
   - Automatic list creation from meal plans
   - Grouping of items by store section
   - Ability to add manual items

4. **Supermarket Integration**:
   - Start with a manual interface to create orders
   - Research APIs for major supermarkets (Tesco, Sainsbury's, Walmart, etc.)
   - Implement automatic cart creation for supported stores

## Data Validation Plan

Ensure proper validation for:

1. **Recipes**:
   - Ingredients must have proper quantities and units
   - Instructions should be properly organized into steps
   - Nutritional information when available

2. **Meal Plans**:
   - Validate weekly plans for balanced meals
   - Check for missing meal types
   - Ensure proper serving sizes for household members

3. **Shopping Lists**:
   - Consolidate similar ingredients
   - Check for units compatibility
   - Validate substitution preferences

## Testing Strategy

1. **Unit Testing**:
   - Test all models and controllers
   - Validate shopping list generation logic
   - Test meal planning calculations

2. **Integration Testing**:
   - Test API endpoints with Postman/Insomnia collections
   - Validate database interactions
   - Test API authentication and authorization

3. **End-to-End Testing**:
   - Test complete user flows from meal planning to shopping
   - Test responsive UI across device sizes
   - Validate supermarket integrations with mock APIs

## User Acceptance Testing

Create test scenarios for:

1. Creating weekly meal plans for a family
2. Adding custom notes to recipes
3. Generating and modifying shopping lists
4. Ordering groceries from partner stores

## Deployment Strategy

1. **Development Environment**:
   - Local MongoDB instance
   - Local Node.js server
   - Development builds of React apps

2. **Staging Environment**:
   - MongoDB Atlas cloud database
   - Heroku/Render for backend hosting
   - Netlify/Vercel for frontend hosting
   - TestFlight/Firebase App Distribution for mobile apps

3. **Production Environment**:
   - MongoDB Atlas with backups
   - AWS/Google Cloud for backend
   - CDN for static assets
   - App Store/Google Play Store for mobile apps

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React.js Documentation](https://reactjs.org/)
- [React Native Documentation](https://reactnative.dev/)
- [Material UI Documentation](https://mui.com/)
- [React Query Documentation](https://react-query.tanstack.com/)
