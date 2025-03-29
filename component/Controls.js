import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Controls({
  isShowList,
  setShowList,
  isPlaying,
  togglePlay,
  onNext,
  onPrevios,
  onReloadSource,
}) {
  const Content = () => (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={setShowList}>
          <Ionicons name="list" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPrevios}>
          <Ionicons name="play-skip-back-circle" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
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
