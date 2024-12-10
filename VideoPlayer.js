import React, { useRef } from "react";
import Video from "react-native-video";
import { Alert } from "react-native";

export default function VideoPlayer({ videoSource }) {
  const videoRef = useRef(null);
  const onError = () => {
    Alert.alert("Lỗi", "An error occurred while playing the video.", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
  };

  return (
    <Video
      source={videoSource}
      ref={videoRef}
      onBuffer={onBuffer}
      onError={onError}
      controls={true}
    />
  );
}
