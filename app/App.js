import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Player from "./Player";
import SwipeableBox from "./SwipeBox";

const API_URL = "https://collection-backend.deno.dev";

export default function App() {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const colorScheme = useColorScheme();

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  const listFilesInFolder = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };

  const generatePresignedUrl = async (fileName) => {
    try {
      const response = await fetch(
        `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const fileList = await listFilesInFolder();
      setFiles(fileList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  const handleFilePress = async (fileName) => {
    try {
      const presignedUrl = await generatePresignedUrl(fileName);
      if (presignedUrl) {
        setSelectedVideo({ uri: presignedUrl, name: fileName });
      }
      setShowPlaylist(false);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const handleVideoEnd = () => {
    if (autoPlayNext) {
      const currentIndex = files.indexOf(selectedVideo.name);
      const nextIndex = (currentIndex + 1) % files.length;
      handleFilePress(files[nextIndex]);
    }
  };

  const handleVideoPrevious = () => {
    const currentIndex = files.indexOf(selectedVideo.name);
    const previousIndex = (currentIndex - 1 + files.length) % files.length;
    handleFilePress(files[previousIndex]);
  };

  const toggleAutoPlayNext = () => {
    setAutoPlayNext(!autoPlayNext);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const fileList = await listFilesInFolder();
        console.log("Files loaded:", fileList);
        setFiles(fileList);
        if (fileList.length > 0) {
          const firstVideoUrl = await generatePresignedUrl(fileList[0]);
          console.log("First video URL:", firstVideoUrl);
          setSelectedVideo({ uri: firstVideoUrl, name: fileList[0] });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <StatusBar barStyle={"light-content"} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text
            style={[
              styles.loadingText,
              { color: colorScheme === "dark" ? "#ffffff" : "#007bff" },
            ]}
          >
            Đang tải...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <SwipeableBox />
          {selectedVideo && (
            <Player videoSource={selectedVideo} onEnd={handleVideoEnd} />
          )}

          {showPlaylist && (
            <>
              <View style={styles.playlistContainer}>
                <FlatList
                  data={files}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.playlistItem,
                        selectedVideo?.name === item &&
                          styles.playlistItemActive,
                      ]}
                      onPress={() => handleFilePress(item)}
                    >
                      <Icon
                        name="movie"
                        size={24}
                        color="#fff"
                        style={styles.fileIcon}
                      />
                      <Text style={styles.playlistItemText} numberOfLines={1}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                />
              </View>
              <TouchableOpacity
                style={styles.playlistBackground}
                onPress={togglePlaylist}
              ></TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fileList: {
    maxHeight: 100,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  listContent: {
    padding: 8,
  },
  fileItem: {
    width: 150,
    margin: 5,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  fileContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    marginRight: 12,
  },
  fileName: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 1000,
  },

  playlistContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    padding: 10,
  },
  playlistBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "transparent",
    padding: 10,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  playlistItemActive: {
    backgroundColor: "black",
  },
  playlistItemText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
});
