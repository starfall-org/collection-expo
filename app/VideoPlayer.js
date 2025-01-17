import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
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
  const [fullscreen, setFullscreen] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

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
        fullscreen={fullscreen}
        onProgress={({ currentTime }) => setCurrentTime(currentTime)}
        onLoad={({ duration }) => setDuration(duration)}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Icon name="play-skip-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleAutoPlayNext}
          style={styles.controlButton}
        >
          <Icon
            name={autoPlayNext ? "arrow-forward-circle-sharp" : "arrow-forward-circle-outline"}
            size={24}
            color={autoPlayNext ? "#0f0" : "#fff"}
          />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.controlButton}
          >
            <Icon name={paused ? "play" : "pause"} size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={onEnd} style={styles.controlButton}>
          <Icon name="play-skip-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleFullscreen}
          style={styles.controlButton}
        >
          <Icon name="resize" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(currentTime / duration) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.timeText}>
        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
      </Text>
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
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#555",
  },
  progressBar: {
    height: 5,
    backgroundColor: "#0f0",
  },
  timeText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    color: "#fff",
    fontSize: 12,
  },
});
