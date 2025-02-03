import { View, Text, TouchableOpacity, FlatList } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Playlist({ files, selectedVideo, handleFilePress, closePlaylist }) {
  return (
    <>
      <View className="absolute top-0 left-0 bottom-0 w-1/2 bg-black/50 rounded-tl-[15px] rounded-bl-[15px] p-2.5">
        <FlatList
          data={files}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-lg mb-1.5 ${
                selectedVideo?.name === item ? "bg-black" : "bg-white/10"
              }`}
              onPress={() => handleFilePress(item)}
            >
              <Ionicons
                name={selectedVideo?.name === item ? "checkmark" : "play"}
                size={20}
                color="white"
              />
              <Text
                className="text-white text-sm flex-1 ml-2.5"
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>
      <TouchableOpacity
        className="absolute top-0 right-0 bottom-0 w-1/2 bg-transparent p-2.5"
        onPress={closePlaylist}
      ></TouchableOpacity>
    </>
  );
}
