import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

const { width, height } = Dimensions.get("screen");

export default function Player({ videoSource, onEnd }) {
  const player = useVideoPlayer(videoSource, (player) => {});

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        allowsFullscreen
        allowsPictureInPicture
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: player.playing ? "" : "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          player.playing ? player.pause() : player.play();
        }}
      ></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: height,
  },
});
