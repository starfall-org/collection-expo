import React, { useState, useEffect, useCallback } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Video from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { listFiles, getSource, reloadSource } from "./lib/api";
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

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  }, [isPlaying, setPlaying]);

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
            onEnd={() => {
              onNext();
            }}
           
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
          isShowList={showPlaylist}
          setShowList={() => setShowPlaylist(!showPlaylist)}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          onNext={onNext}
          onPrevios={onPrevios}
          onReloadSource={onReloadSource}
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
