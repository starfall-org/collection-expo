import React, { useState, useEffect, useCallback } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
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
  const [sources, setSources] = useState({});
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const player = useVideoPlayer(null, (player) => {
    player.showNowPlayingNotification = true;
  });

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
      const currentFile = selectedFile;
      if (sources[currentFile]) {
        player.replace(sources[currentFile]);
      } else {
        getSource(currentFile).then((sourceURI) => {
          const newSources = { ...sources, [currentFile]: sourceURI };
          setSources(newSources);
          if (selectedFile === currentFile) {
            player.replace(sourceURI);
          }
        });
      }
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
          <VideoView
            style={styles.video}
            player={player}
            nativeControls={false}
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
          player={player}
          files={files}
          selectedFile={selectedFile}
          handleSelect={handleSelect}
          isShowList={showPlaylist}
          setShowList={() => setShowPlaylist(!showPlaylist)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
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
