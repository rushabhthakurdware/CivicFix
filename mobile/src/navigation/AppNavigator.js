import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import CreateComplaintScreen from "../screens/CreateComplaintScreen";
import ArTestScreen from "../screens/ArTestScreen";
import ARMeasureScreen from "../screens/ARMeasureScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import NotificationsScreen from "../screens/Notificationsscreen";
import MyComplaintsScreen from "../screens/Mycomplaintsscreen";
import ComplaintDetailScreen from "../screens/Complaintdetailscreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? "Home" : "Login"}
      >
        {user ? (
          <>
            {/* Home MUST be first (or rely on initialRouteName above) so a
                fresh login always lands here, not on a dev/test screen. */}
            <Stack.Screen name="Home" component={HomeScreen} />

            <Stack.Screen name="CreateComplaint" component={CreateComplaintScreen} />

            <Stack.Screen
              name="ARMeasure"
              component={ARMeasureScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} options={{ headerShown: true, title: "Track Your Reports" }} />
            <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: true, title: "Report Details" }} />
            <Stack.Screen
              name="ArTest"
              component={ArTestScreen}
              options={{ headerShown: true, title: "AR Test" }}
            />

            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: true, title: "Notifications" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}