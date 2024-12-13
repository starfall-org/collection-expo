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
} from "react-native";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./libs/s3Client";
import VideoPlayer from "./VideoPlayer";
import Icon from "react-native-vector-icons/Ionicons";

const BUCKET_NAME = "bosuutap";
const FOLDER_NAME = "video";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const listFilesInFolder = async (bucketName, folderName) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderName + "/",
      });

      const response = await s3Client.send(command);

      return response.Contents
        ? response.Contents.filter((obj) => obj.Key !== folderName + "/").map(
            (obj) => obj.Key.replace(folderName + "/", "")
          )
        : [];
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };

  const generatePresignedUrl = async (bucketName, objectKey) => {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      return presignedUrl;
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
      const fileList = await listFilesInFolder(BUCKET_NAME, FOLDER_NAME);
      setFiles(fileList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  const handleFilePress = async (fileName) => {
    try {
      const presignedUrl = await generatePresignedUrl(
        BUCKET_NAME,
        `${FOLDER_NAME}/${fileName}`
      );

      if (presignedUrl) {
        setSelectedVideo({ uri: presignedUrl });
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f4" />

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
            <VideoPlayer videoSource={selectedVideo} />
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
    backgroundColor: "#f4f4f4",
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
