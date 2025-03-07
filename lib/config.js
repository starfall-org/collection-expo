import { BackHandler, ToastAndroid, PermissionsAndroid } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

const requestNotificationPermission = async () => {
  if (
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  )
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show(
          "Notification permission granted",
          ToastAndroid.SHORT
        );
        console.log("You can use the notifications");
      } else {
        ToastAndroid.show("Notification permission denied", ToastAndroid.SHORT);
        console.log("Notification permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
};

export function setConfig() {
  let lastBackPress = 0;
  const handleBackPress = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastBackPress;
    if (timeDiff < 2000) {
      BackHandler.exitApp();
      return true;
    } else {
      lastBackPress = currentTime;
      ToastAndroid.show(
        "Nhấn lại lần nữa để thoát ứng dụng",
        ToastAndroid.SHORT
      );
      return true;
    }
  };

  const setNavigationBar = async () => {
    await NavigationBar.setBackgroundColorAsync("#000000");
    await NavigationBar.setButtonStyleAsync("dark");
    await NavigationBar.setVisibilityAsync("hidden");
  };

  requestNotificationPermission();

  BackHandler.addEventListener("hardwareBackPress", handleBackPress);

  setNavigationBar();
}
