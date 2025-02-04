import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Playlist({
  files,
  selectedVideo,
  handleSelect,
  closePlaylist,
}) {
  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={files}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.itemContainer,
                selectedVideo?.name === item
                  ? styles.selectedItem
                  : styles.normalItem,
              ]}
              onPress={() => handleSelect(item)}
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
          )}
          keyExtractor={(item) => item}
        />
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={closePlaylist}
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
