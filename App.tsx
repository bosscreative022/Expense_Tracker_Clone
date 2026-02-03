import React from 'react';
import { StatusBar, useColorScheme, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, List, Users, User, ChartNoAxesColumn } from 'lucide-react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Screens
import HomeScreen from './src/screens/Home';
import TransactionsScreen from './src/screens/Transactions';
import SplitScreen from './src/screens/Split';
import AnalyticsScreen from './src/screens/Analytics';
import ProfileScreen from './src/screens/Profile';
import AddIncome from './src/screens/Income';
import CustomCalendar from './src/screens/CustomCalendar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#000000',
  border: '#2a2a2a',
  primary: '#3c83f6',
  gray: '#666',
  activeBg: '#0e1c33',
};
function getTabBarStyle(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

  if (routeName === 'Income') {
    return { display: 'none' }; // 👈 hide bottom nav
  }

  return styles.tabBar; // 👈 normal bottom nav
}

function HomeStack() {
  return (
   <Stack.Navigator
  screenOptions={{
    cardStyle: { backgroundColor: '#000' },
    animation: 'fade',
    headerShown: false
  }}
>

      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Income" component={AddIncome} />
      <Stack.Screen name="Calendar" component={CustomCalendar} />
    </Stack.Navigator>
  );
}


function CustomTabBarIcon({ focused, IconComponent, label }: any) {
  return (
    <View style={styles.navItem}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <IconComponent
          size={20}
          color={focused ? COLORS.primary : COLORS.gray}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>

      {focused && (
        <Text style={styles.navLabelActive} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: styles.tabBar,
          }}
        >
          <Tab.Screen
  name="HomeTab"
  component={HomeStack}
  options={({ route }) => ({
    tabBarStyle: getTabBarStyle(route),
    tabBarIcon: ({ focused }) => (
      <CustomTabBarIcon focused={focused} IconComponent={Home} label="Home" />
    ),
  })}
/>


          <Tab.Screen
            name="TransactionsTab"
            component={TransactionsScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon focused={focused} IconComponent={List} label="Transactions" />
              ),
            }}
          />

          <Tab.Screen
            name="SplitTab"
            component={SplitScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon focused={focused} IconComponent={Users} label="Split" />
              ),
            }}
          />

          <Tab.Screen
            name="AnalyticsTab"
            component={AnalyticsScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon focused={focused} IconComponent={ChartNoAxesColumn} label="Analytics" />
              ),
            }}
          />

          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon focused={focused} IconComponent={User} label="Profile" />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    height: Platform.OS === 'ios' ? 80 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    paddingTop: 15,
    borderTopColor: COLORS.background,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH / 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: COLORS.activeBg,
  },
  navLabelActive: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
    fontFamily: 'Outfit-SemiBold',
  },
});
