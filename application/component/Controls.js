import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";

const Controls = ({ player, onPrevios, onNext, onShowList, isShowList }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (isVisible && isPlaying) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const onPlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsVisible(true);
    } else {
      player.play();
    }
  };

  const handlePress = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-end" />
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View className="absolute top-0 left-0 right-0 bottom-0 justify-end">
        <View className="flex-row justify-around items-center w-full bg-black/30 bottom-0 py-5">
          <TouchableOpacity onPress={onShowList}>
            <Ionicons
              name={isShowList ? "list-circle" : "list-circle-outline"}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPrevios}>
            <Ionicons name="play-skip-back-circle" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPlayPause}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext}>
            <Ionicons name="play-skip-forward-circle" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Controls;
