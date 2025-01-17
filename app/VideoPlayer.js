import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

export default function VideoPlayer({
  videoSource,
  onEnd,
  onPrevious,
  autoPlayNext,
  toggleAutoPlayNext,
}) {
  const [paused, setPaused] = useState(true);
  const [scaleValue] = useState(new Animated.Value(1));

  const togglePlayPause = () => {
    setPaused(!paused);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoSource.uri }}
        resizeMode="contain"
        controls={false}
        style={styles.video}
        paused={paused}
        repeat={false}
        onEnd={onEnd}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Icon name="play-skip-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleAutoPlayNext}
          style={styles.controlButton}
        >
          <Icon
            name={autoPlayNext ? "repeat" : "repeat-outline"}
            size={24}
            color={autoPlayNext ? "#0f0" : "#fff"}
          />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.controlButton}
          >
            <Icon name={paused ? "play" : "pause"} size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={onEnd} style={styles.controlButton}>
          <Icon name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: height * 0.6,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  controlButton: {
    padding: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
