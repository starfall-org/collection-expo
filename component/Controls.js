import React, { useState, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useEvent, useEventListener } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { reloadSource } from "../lib/api";

export default function Controls({
  player,
  files,
  selectedFile,
  handleSelect,
  isShowList,
  setShowList,
}) {
  const [isEnded, setEnded] = useState(false);

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

  const onPlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      if (isEnded) {
        player.replay();
      } else {
        player.play();
      }
    }
  }, [isPlaying, isEnded]);

  const onPrevios = useCallback(() => {
    const currentIndex = files.indexOf(selectedFile);
    if (currentIndex > 0) {
      const prevFile = files[currentIndex - 1];
      handleSelect(prevFile);
    }
  }, [files, selectedFile]);

  const onNext = useCallback(() => {
    const currentIndex = files.indexOf(selectedFile);
    if (currentIndex < files.length - 1) {
      const nextFile = files[currentIndex + 1];
      handleSelect(nextFile);
    }
  }, [files, selectedFile]);

  const onReloadSource = useCallback(async () => {
    await reloadSource(selectedFile);
  }, [selectedFile]);

  const Content = () => (
    <View style={styles.container}>
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
    </View>
  );
  return <> {isShowList ? null : <Content />}</>;
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
