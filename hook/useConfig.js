import { useState, useEffect } from "react";
import { BackHandler, ToastAndroid, PermissionsAndroid } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";

const requestReadPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the storage");
    } else {
      console.log("Storage permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestWritePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the storage");
    } else {
      console.log("Storage permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

const requestNotificationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the notifications");
    } else {
      console.log("Notification permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

export function useConfig({ exitAppHandler }) {
  const [lastBackPress, setLastBackPress] = useState(0);

  const handleBackPress = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastBackPress;
    if (timeDiff < 2000) {
      exitAppHandler();
      BackHandler.exitApp();
      return true;
    } else {
      setLastBackPress(currentTime);
      ToastAndroid.show(
        "Nhấn lại lần nữa để thoát ứng dụng",
        ToastAndroid.SHORT
      );
      return true;
    }
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [lastBackPress]);

  useEffect(() => {
    requestReadPermission();
    requestWritePermission();
    requestNotificationPermission();
    const setNavigationBar = async () => {
      await NavigationBar.setBackgroundColorAsync("#000000");
      await NavigationBar.setButtonStyleAsync("dark");
      await NavigationBar.setVisibilityAsync("hidden");
    };

    setNavigationBar();
  }, []);

  useKeepAwake();
}
