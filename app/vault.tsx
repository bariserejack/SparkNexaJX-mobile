import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInRight, FadeInUp, Layout } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Theme } from "../constants/Theme";
import { useAppTheme } from "../lib/theme";
import { useDrawerBack } from "../lib/useDrawerBack";

const { width } = Dimensions.get("window");

const CATEGORIES = ["All", "PDFs", "Archives", "Docs"];

type VaultFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
};

export default function VaultScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const handleBack = useDrawerBack();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<VaultFile[]>([
    { id: "1", name: "Enterprise_Auth_Boilerplate.zip", type: "zip", size: "14.2 MB", date: "2h ago" },
    { id: "2", name: "Neural_UI_Design_System.pdf", type: "pdf", size: "4.8 MB", date: "Yesterday" },
    { id: "3", name: "Core_Engine_Specs.docx", type: "doc", size: "1.2 MB", date: "3 days ago" },
  ]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === "PDFs" && file.type === "pdf") ||
        (activeCategory === "Archives" && file.type === "zip") ||
        (activeCategory === "Docs" && (file.type === "doc" || file.type === "docx"));
      return matchesSearch && matchesCategory;
    });
  }, [files, search, activeCategory]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (!result.canceled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsUploading(true);
        setTimeout(() => {
          const newFile: VaultFile = {
            id: Math.random().toString(),
            name: result.assets[0].name,
            type: result.assets[0].name.split(".").pop() || "file",
            size: `${((result.assets[0].size || 0) / 1024 / 1024).toFixed(1)} MB`,
            date: "Just now",
          };
          setFiles((prev) => [newFile, ...prev]);
          setIsUploading(false);
        }, 1200);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFile = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => deleteFile(id)} activeOpacity={0.8}>
      <Ionicons name="trash-sharp" size={16} color="#FFF" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[styles.glowTarget, { opacity: isDark ? 0.1 : 0.06 }]} />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Vault</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.infoCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="shield-checkmark" size={16} color={Theme.brand.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <BlurView
            intensity={20}
            tint={isDark ? "dark" : "light"}
            style={[styles.capacityCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
          >
            <View style={styles.capacityHeader}>
              <Text style={[styles.capacityText, { color: activeTheme.textMuted }]}>Storage Capacity</Text>
              <Text style={[styles.capacityPercent, { color: activeTheme.text }]}>64%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: activeTheme.border }]}> 
              <LinearGradient colors={[Theme.brand.primary, "#ce9ffc"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: "64%" }]} />
            </View>
          </BlurView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {CATEGORIES.map((cat, idx) => (
              <Animated.View key={cat} entering={FadeInRight.delay(idx * 50)}>
                <TouchableOpacity
                  onPress={() => {
                    setActiveCategory(cat);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryBtn,
                    { backgroundColor: activeTheme.card, borderColor: activeTheme.border },
                    activeCategory === cat && styles.categoryBtnActive,
                  ]}
                >
                  <Text style={[styles.categoryText, { color: activeTheme.textMuted }, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
            <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Filter by name..."
              placeholderTextColor={activeTheme.textMuted}
              style={[styles.searchInput, { color: activeTheme.text }]}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.fileListSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Assets</Text>
              <Text style={[styles.fileCount, { color: activeTheme.textMuted }]}>{filteredFiles.length} Files</Text>
            </View>

            {isUploading && (
              <Animated.View entering={FadeIn} style={styles.uploadingLoader}>
                <Text style={styles.loaderText}>Encrypting and Uploading...</Text>
              </Animated.View>
            )}

            {filteredFiles.map((file, index) => (
              <Animated.View entering={FadeInUp.delay(index * 80)} layout={Layout.springify()} key={file.id}>
                <Swipeable
                  renderRightActions={() => renderRightActions(file.id)}
                  overshootRight={false}
                  onSwipeableWillOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <TouchableOpacity activeOpacity={0.9} style={[styles.fileItem, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
                    <View style={[styles.fileIconBox, { backgroundColor: file.type === "pdf" ? "rgba(255, 59, 48, 0.1)" : "rgba(115, 103, 240, 0.1)" }]}>
                      <Ionicons
                        name={file.type === "pdf" ? "document-text" : file.type === "zip" ? "archive" : "file-tray-full"}
                        size={16}
                        color={file.type === "pdf" ? "#FF3B30" : Theme.brand.primary}
                      />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={[styles.fileName, { color: activeTheme.text }]} numberOfLines={1}>{file.name}</Text>
                      <Text style={[styles.fileMeta, { color: activeTheme.textMuted }]}>{file.size} - {file.date}</Text>
                    </View>
                    <Ionicons name="ellipsis-vertical" size={16} color={activeTheme.textMuted} />
                  </TouchableOpacity>
                </Swipeable>
              </Animated.View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={handleUpload} activeOpacity={0.8}>
          <LinearGradient colors={[Theme.brand.primary, "#ce9ffc"]} style={styles.fabGradient}>
            <Ionicons name="cloud-upload" size={16} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowTarget: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    backgroundColor: Theme.brand.primary,
    borderRadius: 100,
    filter: Platform.OS === "ios" ? "blur(50px)" : undefined,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 36, fontWeight: "900", letterSpacing: -1.5 },
  infoCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  capacityCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
    overflow: "hidden",
  },
  capacityHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  capacityText: { fontSize: 12, fontWeight: "700" },
  capacityPercent: { fontSize: 12, fontWeight: "900" },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },

  categoryContainer: { marginBottom: 20, flexDirection: "row" },
  categoryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryBtnActive: { backgroundColor: Theme.brand.primary, borderColor: Theme.brand.primary },
  categoryText: { fontSize: 12, fontWeight: "800" },
  categoryTextActive: { color: "#FFF" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 54,
    marginBottom: 30,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600" },

  fileListSection: { marginTop: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  fileCount: { fontSize: 12, fontWeight: "700" },

  uploadingLoader: {
    padding: 15,
    backgroundColor: "rgba(115, 103, 240, 0.05)",
    borderRadius: 15,
    marginBottom: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Theme.brand.primary,
    alignItems: "center",
  },
  loaderText: { color: Theme.brand.primary, fontSize: 12, fontWeight: "800" },

  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
  },
  fileIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  fileDetails: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  fileMeta: { fontSize: 11, fontWeight: "600" },

  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 24,
    marginBottom: 12,
    marginLeft: 10,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 25,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Theme.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  fabGradient: { width: 70, height: 70, borderRadius: 28, justifyContent: "center", alignItems: "center" },
});
