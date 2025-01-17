import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import VideoPlayer from "./VideoPlayer";

const API_URL = "https://collection-backend.deno.dev";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const colorScheme = useColorScheme();

  const listFilesInFolder = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };

  const generatePresignedUrl = async (fileName) => {
    try {
      const response = await fetch(`${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`);
      if (!response.ok) throw new Error('Network response was not ok');
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

  const renderFileItem = ({ item }) => (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={() => handleFilePress(item)}
    >
      <Icon name="videocam" size={24} color="#007bff" style={styles.fileIcon} />
      <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="tail">
        {item}
      </Text>
      <Icon name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f4f4f4' }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colorScheme === 'dark' ? "#000" : "#f4f4f4"} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : files.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Icon name="folder-open" size={64} color="#888" />
          <Text style={styles.emptyStateText}>Không có video nào</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item}
          style={styles.fileList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={!!selectedVideo}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setSelectedVideo(null)}
      >
        {selectedVideo && (
          <View style={styles.modalContainer}>
            <VideoPlayer
              videoSource={selectedVideo}
              onEnd={handleVideoEnd}
              onPrevious={handleVideoPrevious}
              autoPlayNext={autoPlayNext}
              toggleAutoPlayNext={toggleAutoPlayNext}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedVideo(null)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fileList: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  fileItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    marginRight: 10,
  },
  fileName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007bff",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    color: "#888",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
  },
});
