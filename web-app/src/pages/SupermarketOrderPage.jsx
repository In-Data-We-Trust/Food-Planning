import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  DateRange,
  Payment,
  Check,
  Delete,
  Edit,
  Add
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const steps = ['Shopping List', 'Select Store', 'Delivery Options', 'Payment', 'Review'];

const SupermarketOrderPage = () => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [substitutionPreferences, setSubstitutionPreferences] = useState({});

  // Fetch shopping lists
  const { data: shoppingLists, isLoading: isListsLoading } = useQuery(
    'shoppingLists',
    async () => {
      const response = await axios.get('/api/shopping-lists');
      return response.data;
    }
  );

  // Fetch stores
  const { data: stores, isLoading: isStoresLoading } = useQuery(
    'stores',
    async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
    {
      enabled: activeStep >= 1
    }
  );

  // Get selected list details
  const { data: selectedList, isLoading: isSelectedListLoading } = useQuery(
    ['shoppingList', selectedListId],
    async () => {
      const response = await axios.get(`/api/shopping-lists/${selectedListId}`);
      return response.data;
    },
    {
      enabled: !!selectedListId
    }
  );

  // Get selected store details
  const { data: selectedStore, isLoading: isSelectedStoreLoading } = useQuery(
    ['store', selectedStoreId],
    async () => {
      const response = await axios.get(`/api/stores/${selectedStoreId}`);
      return response.data;
    },
    {
      enabled: !!selectedStoreId
    }
  );

  // Mutation to create an order
  const createOrderMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/orders', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setOrderData(data);
        queryClient.invalidateQueries('orders');
      }
    }
  );

  // Mutation to submit an order to the store
  const submitOrderMutation = useMutation(
    async (orderId) => {
      const response = await axios.post(`/api/orders/${orderId}/submit`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setOrderData(data);
        queryClient.invalidateQueries('orders');
      }
    }
  );

  // Initialize substitution preferences when list is loaded
  useEffect(() => {
    if (selectedList?.items) {
      const preferences = {};
      selectedList.items.forEach(item => {
        preferences[item._id] = 'Similar Item';
      });
      setSubstitutionPreferences(preferences);
    }
  }, [selectedList]);

  const handleNext = () => {
    if (activeStep === 0 && !orderData) {
      // Create initial order when moving from step 0 to 1
      createOrderMutation.mutate({
        shoppingList: selectedListId,
        store: null,
        orderType: 'Delivery',
        status: 'Draft',
        items: []
      });
    } else if (activeStep === 4) {
      // Submit final order
      submitOrderMutation.mutate(orderData._id);
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateOrder = async (updateData) => {
    if (!orderData?._id) return;
    
    try {
      const response = await axios.patch(`/api/orders/${orderData._id}`, updateData);
      setOrderData(response.data);
      queryClient.invalidateQueries(['order', orderData._id]);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
    updateOrder({ store: storeId });
  };

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    updateOrder({ orderType: method === 'delivery' ? 'Delivery' : 'Pickup' });
  };

  const handleDeliveryDateTimeConfirm = () => {
    if (!deliveryDate || !deliveryTime) return;
    
    const dateObj = new Date(deliveryDate);
    const timeObj = new Date(deliveryTime);
    
    dateObj.setHours(timeObj.getHours(), timeObj.getMinutes());
    
    updateOrder({
      scheduledDate: dateObj.toISOString(),
      scheduledTimeSlot: {
        start: format(timeObj, 'HH:mm'),
        end: format(new Date(timeObj.getTime() + 60 * 60 * 1000), 'HH:mm')
      }
    });
  };

  const handleAddressConfirm = () => {
    updateOrder({ deliveryAddress });
  };

  const handlePaymentMethodConfirm = () => {
    updateOrder({ paymentMethod });
  };

  const handleSubstitutionChange = (itemId, value) => {
    setSubstitutionPreferences(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    // Update the item in the order
    if (orderData && orderData.items) {
      const updatedItems = orderData.items.map(item => {
        if (item._id === itemId) {
          return {
            ...item,
            substitutionPreference: value
          };
        }
        return item;
      });
      
      updateOrder({ items: updatedItems });
    }
  };

  // Render different content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Shopping List Selection
        return (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Select a Shopping List
            </Typography>
            {isListsLoading ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={3}>
                {shoppingLists?.map((list) => (
                  <Grid item xs={12} md={6} lg={4} key={list._id}>
                    <Card 
                      elevation={selectedListId === list._id ? 3 : 1}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedListId === list._id ? '2px solid #1976d2' : 'none',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => setSelectedListId(list._id)}
                    >
                      <CardContent>
                        <Typography variant="h6">{list.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {list.items?.length || 0} items
                        </Typography>
                        {list.mealPlan && (
                          <Typography variant="body2" color="text.secondary">
                            From meal plan: {list.mealPlan.name}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(list.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {selectedListId && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Shopping List Items
                </Typography>
                {isSelectedListLoading ? (
                  <CircularProgress />
                ) : (
                  <List>
                    {selectedList?.items?.map((item) => (
                      <ListItem key={item._id}>
                        <ListItemIcon>
                          <ShoppingCart />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${item.ingredient.name}`} 
                          secondary={`${item.ingredient.quantity} ${item.ingredient.unit}`} 
                        />
                        <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
                          <InputLabel>Substitution</InputLabel>
                          <Select
                            value={substitutionPreferences[item._id] || 'Similar Item'}
                            onChange={(e) => handleSubstitutionChange(item._id, e.target.value)}
                            label="Substitution"
                          >
                            <MenuItem value="No Substitution">No Substitution</MenuItem>
                            <MenuItem value="Similar Item">Similar Item</MenuItem>
                            <MenuItem value="Any Substitution">Any Substitution</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Box>
        );
        
      case 1: // Store Selection
        return (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Select a Store
            </Typography>
            {isStoresLoading ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={3}>
                {stores?.map((store) => (
                  <Grid item xs={12} md={6} lg={4} key={store._id}>
                    <Card 
                      elevation={selectedStoreId === store._id ? 3 : 1}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedStoreId === store._id ? '2px solid #1976d2' : 'none',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => handleStoreSelect(store._id)}
                    >
                      <CardContent>
                        <Typography variant="h6">{store.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {store.chain}
                        </Typography>
                        {store.location && (
                          <Typography variant="body2" color="text.secondary">
                            {store.location.address}, {store.location.city}
                          </Typography>
                        )}
                        <Box mt={1}>
                          {store.deliveryAvailable && (
                            <Chip 
                              label="Delivery Available" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          )}
                          {store.pickupAvailable && (
                            <Chip 
                              label="Pickup Available" 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
        
      case 2: // Delivery Options
        return (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Delivery Options
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Delivery Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup 
                  row 
                  value={deliveryMethod} 
                  onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                >
                  <FormControlLabel 
                    value="delivery" 
                    control={<Radio />} 
                    label="Home Delivery" 
                    disabled={!selectedStore?.deliveryAvailable} 
                  />
                  <FormControlLabel 
                    value="pickup" 
                    control={<Radio />} 
                    label="Store Pickup" 
                    disabled={!selectedStore?.pickupAvailable}
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Date and Time
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Delivery/Pickup Date"
                      value={deliveryDate}
                      onChange={setDeliveryDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Delivery/Pickup Time"
                      value={deliveryTime}
                      onChange={setDeliveryTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={handleDeliveryDateTimeConfirm}
                  disabled={!deliveryDate || !deliveryTime}
                >
                  Confirm Date & Time
                </Button>
              </Box>
            </Paper>
            
            {deliveryMethod === 'delivery' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Delivery Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Street Address"
                      fullWidth
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="City"
                      fullWidth
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="State"
                      fullWidth
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Zip Code"
                      fullWidth
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Delivery Instructions"
                      fullWidth
                      multiline
                      rows={2}
                      value={deliveryAddress.notes}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    onClick={handleAddressConfirm}
                    disabled={!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode}
                  >
                    Confirm Address
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        );
        
      case 3: // Payment
        return (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            
            <Paper sx={{ p: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="Credit Card" control={<Radio />} label="Credit Card" />
                  <FormControlLabel value="PayPal" control={<Radio />} label="PayPal" />
                  <FormControlLabel value="Apple Pay" control={<Radio />} label="Apple Pay" />
                  <FormControlLabel value="Google Pay" control={<Radio />} label="Google Pay" />
                  {deliveryMethod === 'pickup' && (
                    <FormControlLabel value="Pay at Pickup" control={<Radio />} label="Pay at Pickup" />
                  )}
                </RadioGroup>
              </FormControl>
              
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={handlePaymentMethodConfirm}
                  disabled={!paymentMethod}
                >
                  Confirm Payment Method
                </Button>
              </Box>
            </Paper>
          </Box>
        );
        
      case 4: // Review
        return (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Review Your Order
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Shopping List:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {selectedList?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Store:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {selectedStore?.name} ({selectedStore?.chain})
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Order Type:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {deliveryDate && deliveryTime 
                      ? `${format(deliveryDate, 'MMMM d, yyyy')} at ${format(deliveryTime, 'h:mm a')}` 
                      : 'Not specified'}
                  </Typography>
                </Grid>
                
                {deliveryMethod === 'delivery' && (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Address:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {`${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`}
                      </Typography>
                      {deliveryAddress.notes && (
                        <Typography variant="body2">
                          Instructions: {deliveryAddress.notes}
                        </Typography>
                      )}
                    </Grid>
                  </>
                )}
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {paymentMethod}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Items ({selectedList?.items?.length || 0})
              </Typography>
              
              <List>
                {selectedList?.items?.map((item) => (
                  <ListItem key={item._id}>
                    <ListItemIcon>
                      <ShoppingCart />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${item.ingredient.name}`} 
                      secondary={`${item.ingredient.quantity} ${item.ingredient.unit}`} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {substitutionPreferences[item._id] || 'Similar Item'}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Estimated Total:</Typography>
                <Typography variant="subtitle1">$XX.XX</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Final total will be determined by the store based on actual product prices and availability
              </Typography>
            </Paper>
          </Box>
        );
        
      case 5: // Confirmation
        return (
          <Box mt={4} textAlign="center">
            <Check color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h4" color="success.main" gutterBottom>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been submitted to {selectedStore?.name}.
            </Typography>
            <Typography variant="body1" paragraph>
              {deliveryMethod === 'delivery' 
                ? `Your items will be delivered on ${format(deliveryDate, 'MMMM d, yyyy')} between ${format(deliveryTime, 'h:mm a')} and ${format(new Date(deliveryTime.getTime() + 60 * 60 * 1000), 'h:mm a')}.`
                : `Your items will be ready for pickup on ${format(deliveryDate, 'MMMM d, yyyy')} at ${format(deliveryTime, 'h:mm a')}.`}
            </Typography>
            <Typography variant="body1" paragraph>
              Order Reference: {orderData?.storeOrderId || 'Processing'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/orders'}
              sx={{ mt: 2 }}
            >
              View My Orders
            </Button>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Groceries
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            disabled={activeStep === 0 || activeStep === 5}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !selectedListId) ||
              (activeStep === 1 && !selectedStoreId) ||
              (activeStep === 2 && !deliveryDate) ||
              (activeStep === 3 && !paymentMethod) ||
              activeStep === 5
            }
          >
            {activeStep === 4 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SupermarketOrderPage;
