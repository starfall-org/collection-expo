import React, { useState, useEffect, useRef } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { listFiles, getSource } from "./lib/api";
import Playlist from "./component/Playlist";
import Controls from "./component/Controls";

const { width, height } = Dimensions.get("screen");

export default function App() {
  useKeepAwake();
  const [files, setFiles] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const sourceRef = useRef(null);
  const player = useVideoPlayer(sourceRef.current?.uri, (player) => {
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

  const handleSelect = async (fileName) => {
    try {
      const pUrl = await getSource(fileName);
      if (pUrl) {
        await AsyncStorage.setItem("selectedVideo", fileName);
        sourceRef.current = { uri: pUrl, name: fileName };
        player.replace(pUrl);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"default"} backgroundColor={"black"} hidden />
      <View style={styles.content}>
        {sourceRef.current && (
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls={false}
            />
          </View>
        )}
        {showPlaylist && (
          <Playlist
            files={files}
            selectedVideo={sourceRef.current}
            handleSelect={handleSelect}
            closePlaylist={() => setShowPlaylist(false)}
          />
        )}

        <Controls
          player={player}
          files={files}
          selectedVideo={sourceRef.current}
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
