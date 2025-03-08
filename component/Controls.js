import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from "react-native";
import { useEvent, useEventListener } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { reloadSource } from "../lib/api";

export default function Controls({
  player,
  files,
  selectedVideo,
  handleSelect,
  isShowList,
  setShowList,
}) {
  const visibleRef = useRef(true);
  const [isEnded, setEnded] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") {
      setEnded(false);
      player.play();
    }
  });

  useEventListener(player, "playToEnd", () => {
    setEnded(true);
    setTimeout(() => {
      onNext();
    }, 800);
  });

  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => (visibleRef.current = true));
  };

  const fadeOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => (visibleRef.current = false));
  };

  const onPlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      if (isEnded) {
        player.replay();
      } else {
        player.play();
      }
    }
  };

  const onPrevios = () => {
    const currentIndex = files.indexOf(selectedVideo?.name);
    if (currentIndex > 0) {
      handleSelect(files[currentIndex - 1]);
    }
  };

  const onNext = () => {
    const currentIndex = files.indexOf(selectedVideo?.name);
    if (currentIndex < files.length - 1) {
      handleSelect(files[currentIndex + 1]);
    }
  };

  const onReloadSource = async () => {
    const statusOk = await reloadSource(selectedVideo.name);
    if (statusOk) {
      handleSelect(selectedVideo.name);
    }
  };

  const handlePress = () => {
    if (visibleRef.current) {
      fadeOut();
    } else {
      fadeIn();
    }
  };

  if (!isVisible) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.container} />
      </TouchableWithoutFeedback>
    );
  }

  const Content = () => (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={setShowList}>
            <Ionicons name="list" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPrevios}>
            <Ionicons name="play-skip-back-circle" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPlayPause}>
            <Ionicons
              name={
                isEnded
                  ? "play-circle-sharp"
                  : isPlaying
                  ? "pause-circle"
                  : "play-circle"
              }
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext}>
            <Ionicons name="play-skip-forward-circle" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReloadSource}>
            <Ionicons name="cloud-download" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
  return <>{isShowList ? null : <Content />}</>;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingVertical: 20,
  },
});
