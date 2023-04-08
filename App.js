import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {WelcomeScreen} from './screens/WelcomeScreen'
import {ConfigScreen} from './screens/ConfigScreen'
import {EventsScreen} from './screens/EventsScreen'
import { AddEventScreen } from './screens/AddEventScreen';
import {EditEventScreen} from './screens/EditEventScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { AccountScreen } from './screens/AccountScreen';
import { ManageEventScreen } from './screens/ManageEventScreen';
import { useEffect } from 'react';
import {MapScreen} from './screens/MapScreen'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{headerShown:true, headerTitleAlign:'center'}}
      >

        <Stack.Screen 
          name = 'Welcome'
          component={WelcomeScreen}
        /> 
 
        <Stack.Screen 
          name='Login'
          component={ConfigScreen}
        /> 
        
        <Stack.Screen
          name = 'Registration'
          component={RegisterScreen}
        /> 

        <Stack.Screen
          name = "Events"
          component={EventsScreen}
        />

        <Stack.Screen
          name = 'Account'
          component={AccountScreen}
        />

        <Stack.Screen
          name='Add Event'
          component={AddEventScreen}
        />

        <Stack.Screen
          name = 'Manage Event'
          component={ManageEventScreen}
        />
        
        <Stack.Screen 
          name = 'Edit Event'
          component={EditEventScreen}
        />
        <Stack.Screen
          name = 'Map'
          component={MapScreen}/>

      </Stack.Navigator>
    </NavigationContainer>
    
  );
}
