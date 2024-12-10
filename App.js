import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./libs/minioClient"; // Đảm bảo import đúng client S3
import VideoPlayer from "./VideoPlayer";

const BUCKET_NAME = "bosuutap";
const FOLDER_NAME = "video";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Hàm liệt kê các file trong folder S3
  const listFilesInFolder = async (bucketName, folderName) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderName + "/",
      });

      const response = await s3Client.send(command);

      // Trích xuất tên file, loại bỏ đường dẫn thư mục
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

  // Hàm tạo URL có chữ ký cho video
  const generatePresignedUrl = async (bucketName, objectKey) => {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      // Tạo URL có chữ ký với thời hạn 1 giờ
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
        // Tạo đối tượng source cho VideoPlayer
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
      <Text style={styles.fileName}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách video từ S3</Text>

      {loading ? (
        <Text>Đang tải...</Text>
      ) : files.length === 0 ? (
        <Text>Không có video nào</Text>
      ) : (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item}
          style={styles.fileList}
        />
      )}

      <Modal
        visible={!!selectedVideo}
        transparent={false}
        onRequestClose={() => setSelectedVideo(null)}
      >
        {selectedVideo && (
          <View style={styles.modalContainer}>
            <VideoPlayer videoSource={selectedVideo} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedVideo(null)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
  },
});
