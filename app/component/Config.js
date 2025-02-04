import { useState, useEffect } from "react";
import { BackHandler, ToastAndroid, StatusBar } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";

export default function Config({ exitAppHandler }) {
  const [lastBackPress, setLastBackPress] = useState(0);

  const handleBackPress = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastBackPress;
    if (timeDiff < 2000) {
      BackHandler.exitApp();
      exitAppHandler();
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
    const setNavigationBar = async () => {
      await NavigationBar.setBackgroundColorAsync("#000000");
      await NavigationBar.setButtonStyleAsync("dark");
    };

    setNavigationBar();
  }, []);

  useKeepAwake();

  return <StatusBar barStyle={"default"} backgroundColor={"black"} />;
}
