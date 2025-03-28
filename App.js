import React, { useState, useEffect, useCallback } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Video from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { listFiles, getSource } from "./lib/api";
import Playlist from "./component/Playlist";
import Controls from "./component/Controls";

const { width, height } = Dimensions.get("window");

export default function App() {
  useKeepAwake();
  const [files, setFiles] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [isPlaying, setPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const files = await listFiles();
      setFiles(files);
      if (files.length > 0) {
        const cachedSelectedVideo = await AsyncStorage.getItem("selectedVideo");
        if (cachedSelectedVideo) {
          handleSelect(cachedSelectedVideo);
        } else {
          handleSelect(files[0]);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      getSource(selectedFile).then((sourceURI) => {
        setVideoSource(sourceURI);
      });
    }
  }, [selectedFile]);

  const handleSelect = useCallback((fileName) => {
    try {
      setSelectedFile(fileName);
      AsyncStorage.setItem("selectedVideo", fileName);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"default"} backgroundColor={"black"} hidden />
      <View style={styles.content}>
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoSource }}
            style={styles.video}
            controls={false}
            resizeMode="contain"
            paused={!isPlaying}
            onEnd={() => setPlaying(false)}
          />
        </View>

        {showPlaylist && (
          <Playlist
            files={files}
            selectedFile={selectedFile}
            handleSelect={handleSelect}
            closePlaylist={() => setShowPlaylist(false)}
          />
        )}

        <Controls
          files={files}
          selectedFile={selectedFile}
          handleSelect={handleSelect}
          isShowList={showPlaylist}
          setShowList={() => setShowPlaylist(!showPlaylist)}
          isPlaying={isPlaying}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: height,
  },
});
