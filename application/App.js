import React, { useState } from "react";
import { StatusBar, View, Dimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { listFiles, getSource } from "./lib/api";
import Playlist from "./component/Playlist";
import Controls from "./component/Controls";

const { width, height } = Dimensions.get("screen");

export default async function App() {
  const files = await listFiles();
  const [selectedVideo, setSelectedVideo] = useState({
    uri: await getSource(files[0]),
    name: files[0],
  });
  const [showPlaylist, setShowPlaylist] = useState(false);

  const player = useVideoPlayer(selectedVideo.uri, (player) => {
    player.showNowPlayingNotification = true;
  });

  const handleFilePress = async (fileName) => {
    try {
      const pUrl = await getSource(fileName);
      if (pUrl) {
        setSelectedVideo({ uri: pUrl, name: fileName });
        player.replace(pUrl);
        player.play();
      }
      setShowPlaylist(false);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle={"light-content"} />
      <View className="flex">
        {selectedVideo && (
          <View className="flex-1 justify-center items-center">
            <VideoView
              style={{ width: width, height: height }}
              player={player}
              nativeControls={false}
            />
          </View>
        )}
        {showPlaylist ? (
          <Playlist
            files={files}
            selectedVideo={selectedVideo}
            handleFilePress={handleFilePress}
            closePlaylist={() => setShowPlaylist(!showPlaylist)}
          />
        ) : (
          <Controls
            player={player}
            onPrevios={() => {
              const currentIndex = files.indexOf(selectedVideo.name);
              if (currentIndex > 0) {
                handleFilePress(files[currentIndex - 1]);
              }
            }}
            onNext={() => {
              const currentIndex = files.indexOf(selectedVideo.name);
              if (currentIndex < files.length - 1) {
                handleFilePress(files[currentIndex + 1]);
              }
            }}
            onShowList={() => setShowPlaylist(!showPlaylist)}
            isShowList={showPlaylist}
          />
        )}
      </View>
    </View>
  );
}
