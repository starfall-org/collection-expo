import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

export default function VideoPlayer({ videoSource }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoSource.uri }}
        resizeMode="contain"
        paused={paused}
        style={styles.video}
        onLoad={(data) => setDuration(data.duration)}
        onProgress={(data) => setCurrentTime(data.currentTime)}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}
        >
          <Icon name={paused ? "play" : "pause"} size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: height * 0.6,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    width: width,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playPauseButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    marginHorizontal: 10,
    fontSize: 14,
  },
});
