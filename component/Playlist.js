import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState, useEffect } from "react";

export default function Playlist({
  files,
  selectedVideo,
  handleSelect,
  closePlaylist,
}) {
  const scrollViewRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setLayout(height);
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const index = files.indexOf(selectedVideo?.name) || 1;
    const offset = index * layout;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: offset, animated: true });
    }
  }, [scrollViewRef.current]);

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: -300,
      useNativeDriver: true,
    }).start(() => {
      closePlaylist();
    });
  };

  return (
    <>
      <Animated.View
        style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
      >
        <ScrollView ref={scrollViewRef}>
          {files.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemContainer,
                selectedVideo?.name === item
                  ? styles.selectedItem
                  : styles.normalItem,
              ]}
              onPress={() => handleSelect(item)}
              onLayout={handleLayout}
            >
              <Ionicons
                name={selectedVideo?.name === item ? "checkmark" : "play"}
                size={20}
                color="white"
              />
              <Text style={styles.itemText} numberOfLines={1}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
      ></TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  selectedItem: {
    backgroundColor: "black",
  },
  normalItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  itemText: {
    color: "white",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "transparent",
    padding: 10,
  },
});
