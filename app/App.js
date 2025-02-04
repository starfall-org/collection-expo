import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { listFiles, getSource } from "./lib/api";
import Playlist from "./component/Playlist";
import Controls from "./component/Controls";
import Config from "./component/Config";
import { styles } from "./style";

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const player = useVideoPlayer(selectedVideo?.uri, (player) => {
    player.showNowPlayingNotification = true;
    player.staysActiveInBackground = true;
  });

  useEffect(() => {
    (async () => {
      const files = await listFiles();
      setFiles(files);
      if (files.length > 0) {
        handleSelect(files[0]);
      }
    })();
  }, []);

  const handleSelect = async (fileName) => {
    try {
      const pUrl = await getSource(fileName);
      if (pUrl) {
        setSelectedVideo({ uri: pUrl, name: fileName });
        player.replace(pUrl);
      }
      setShowPlaylist(false);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Config />
      <View style={styles.content}>
        {selectedVideo && (
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls={false}
            />
          </View>
        )}
        {showPlaylist ? (
          <Playlist
            files={files}
            selectedVideo={selectedVideo}
            handleSelect={handleSelect}
            closePlaylist={() => setShowPlaylist(false)}
          />
        ) : (
          <Controls
            player={player}
            files={files}
            selectedVideo={selectedVideo}
            handleSelect={handleSelect}
            isShowList={showPlaylist}
            setShowList={setShowPlaylist}
          />
        )}
      </View>
    </View>
  );
}
