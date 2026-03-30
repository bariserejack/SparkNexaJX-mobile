import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useDrawerBack } from '../lib/useDrawerBack';
import { Theme } from '../constants/Theme';
import { apiUrl } from '../lib/api';
import { useAppTheme } from '../lib/theme';

type Flashcard = { id: string; question: string; answer: string; open: boolean };
type QaMessage = { id: string; role: 'user' | 'assistant'; text: string };

export default function NexaBrainScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const focusKey = Array.isArray(focus) ? focus[0] : focus;

  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [roomTopic, setRoomTopic] = useState('');
  const [rooms, setRooms] = useState<Array<{ id: string; topic: string; live: boolean }>>([
    { id: '1', topic: 'Calculus Q&A', live: true },
    { id: '2', topic: 'Biology Lab Review', live: false },
  ]);
  const [focusMode, setFocusMode] = useState(false);
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaMessages, setQaMessages] = useState<QaMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask me anything. I can explain concepts, draft study plans, or create quick quizzes.',
    },
  ]);
  const handleBack = useDrawerBack();

  const sectionOrder = useMemo(() => {
    if (focusKey === 'qa') return ['qa', 'summary', 'flashcards', 'rooms', 'focus'];
    if (focusKey === 'summary') return ['summary', 'qa', 'flashcards', 'rooms', 'focus'];
    if (focusKey === 'flashcards') return ['flashcards', 'qa', 'summary', 'rooms', 'focus'];
    if (focusKey === 'rooms') return ['rooms', 'qa', 'summary', 'flashcards', 'focus'];
    if (focusKey === 'focus') return ['focus', 'qa', 'summary', 'flashcards', 'rooms'];
    return ['qa', 'summary', 'flashcards', 'rooms', 'focus'];
  }, [focusKey]);

  const buildSummary = () => {
    const parts = notes
      .split(/\n|\./)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      setSummary('Add notes or a chat excerpt to generate a summary.');
      return;
    }
    const top = parts.slice(0, 3);
    setSummary(top.map((p) => `- ${p}`).join('\n'));
  };

  const buildFlashcards = () => {
    const lines = notes
      .split(/\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setFlashcards([
        { id: 'sample-1', question: 'Key idea', answer: 'Add notes to generate flashcards.', open: false },
      ]);
      return;
    }
    const cards = lines.slice(0, 6).map((line, idx) => {
      if (line.includes(':')) {
        const [q, ...rest] = line.split(':');
        return { id: `${idx}`, question: q.trim(), answer: rest.join(':').trim(), open: false };
      }
      return {
        id: `${idx}`,
        question: `Key idea ${idx + 1}`,
        answer: line,
        open: false,
      };
    });
    setFlashcards(cards);
  };

  const toggleCard = (id: string) => {
    setFlashcards((prev) => prev.map((c) => (c.id === id ? { ...c, open: !c.open } : c)));
  };

  const startRoom = () => {
    const topic = roomTopic.trim();
    if (!topic) return;
    setRooms((prev) => [{ id: `${Date.now()}`, topic, live: true }, ...prev]);
    setRoomTopic('');
  };

  const sendQuestion = async () => {
    const text = qaInput.trim();
    if (!text) return;
    const id = `${Date.now()}`;
    const nextMessages = [...qaMessages, { id: `u-${id}`, role: 'user', text }];
    setQaMessages(nextMessages);
    setQaInput('');
    setQaLoading(true);
    try {
      const history = nextMessages.slice(-8).map((msg) => ({ role: msg.role, text: msg.text }));
      const res = await fetch(apiUrl('/api/nexa/qa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Nexa Brain request failed');
      }
      const answer = payload?.answer || 'Nexa Brain is ready. Ask another question.';
      setQaMessages((prev) => [...prev, { id: `a-${id}`, role: 'assistant', text: answer }]);
    } catch (error) {
      setQaMessages((prev) => [
        ...prev,
        {
          id: `a-${id}`,
          role: 'assistant',
          text: 'Sorry, I could not reach Nexa Brain. Please check the API server and OPENAI_API_KEY.',
        },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Nexa Brain</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.heroCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <LinearGradient
              colors={isDark ? ['rgba(115,103,240,0.2)', 'rgba(79,172,254,0.05)'] : ['rgba(115,103,240,0.12)', 'rgba(79,172,254,0.02)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.heroRow}>
              <View style={[styles.heroIcon, { backgroundColor: activeTheme.background }]}>
                <Ionicons name="sparkles" size={18} color={Theme.brand.primary} />
              </View>
              <View style={styles.heroText}>
                <Text style={[styles.heroTitle, { color: activeTheme.text }]}>AI Learning Hub</Text>
                <Text style={[styles.heroSub, { color: activeTheme.textMuted }]}>Summaries, flashcards, study rooms, focus.</Text>
              </View>
            </View>
          </View>

          {sectionOrder.map((section) => {
            if (section === 'qa') {
              return (
                <View key="qa" style={[styles.sectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                  <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Ask Nexa</Text>
                  <Text style={[styles.sectionHint, { color: activeTheme.textMuted }]}>
                    Ask a question, get instant study guidance.
                  </Text>

                  <View style={styles.qaBubbleStack}>
                    {qaMessages.map((msg) => (
                      <View
                        key={msg.id}
                        style={[
                          styles.qaBubble,
                          msg.role === 'user' ? styles.qaBubbleUser : styles.qaBubbleBot,
                          { backgroundColor: msg.role === 'user' ? Theme.brand.primary : activeTheme.background, borderColor: activeTheme.border },
                        ]}
                      >
                        <Text style={[styles.qaText, { color: msg.role === 'user' ? '#FFFFFF' : activeTheme.text }]}>
                          {msg.text}
                        </Text>
                      </View>
                    ))}
                    {qaLoading ? (
                      <View style={[styles.qaBubble, styles.qaBubbleBot, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                        <Text style={[styles.qaText, { color: activeTheme.textMuted }]}>Nexa is thinkingâ€¦</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.qaInputRow}>
                    <TextInput
                      style={[styles.qaInput, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                      placeholder="Ask Nexa a questionâ€¦"
                      placeholderTextColor={activeTheme.textMuted}
                      value={qaInput}
                      onChangeText={setQaInput}
                      onSubmitEditing={sendQuestion}
                      returnKeyType="send"
                    />
                    <TouchableOpacity style={[styles.qaSend, { backgroundColor: Theme.brand.primary }]} onPress={sendQuestion}>
                      <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.qaChips}>
                    {['Explain this', 'Create a quiz', 'Make a study plan'].map((chip) => (
                      <TouchableOpacity
                        key={chip}
                        style={[styles.qaChip, { backgroundColor: activeTheme.background }]}
                        onPress={() => setQaInput(chip)}
                      >
                        <Text style={[styles.qaChipText, { color: activeTheme.text }]}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }
            if (section === 'summary') {
              return (
                <View key="summary" style={[styles.sectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                  <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Pulse Summary</Text>
                  <TextInput
                    style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                    placeholder="Paste notes or message thread..."
                    placeholderTextColor={activeTheme.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]} onPress={buildSummary}>
                      <Ionicons name="flash-outline" size={14} color="#FFF" />
                      <Text style={styles.primaryText}>Generate Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryBtn, { borderColor: activeTheme.border }]} onPress={() => setSummary('')}>
                      <Text style={[styles.secondaryText, { color: activeTheme.text }]}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {summary ? (
                    <View style={[styles.outputBox, { borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
                      <Text style={[styles.outputText, { color: activeTheme.text }]}>{summary}</Text>
                    </View>
                  ) : null}
                </View>
              );
            }

            if (section === 'flashcards') {
              return (
                <View key="flashcards" style={[styles.sectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                  <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Auto Flashcards</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]} onPress={buildFlashcards}>
                      <Ionicons name="albums-outline" size={14} color="#FFF" />
                      <Text style={styles.primaryText}>Generate Cards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryBtn, { borderColor: activeTheme.border }]} onPress={() => setFlashcards([])}>
                      <Text style={[styles.secondaryText, { color: activeTheme.text }]}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.flashGrid}>
                    {flashcards.map((card) => (
                      <TouchableOpacity
                        key={card.id}
                        style={[styles.flashCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                        onPress={() => toggleCard(card.id)}
                      >
                        <Text style={[styles.flashQ, { color: activeTheme.text }]}>{card.question}</Text>
                        {card.open ? (
                          <Text style={[styles.flashA, { color: activeTheme.textMuted }]}>{card.answer}</Text>
                        ) : (
                          <Text style={[styles.flashHint, { color: activeTheme.textMuted }]}>Tap to reveal</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }

            if (section === 'rooms') {
              return (
                <View key="rooms" style={[styles.sectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                  <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Study Rooms</Text>
                  <View style={styles.roomRow}>
                    <TextInput
                      style={[styles.roomInput, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                      placeholder="Create a topic..."
                      placeholderTextColor={activeTheme.textMuted}
                      value={roomTopic}
                      onChangeText={setRoomTopic}
                    />
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]} onPress={startRoom}>
                      <Ionicons name="mic-outline" size={14} color="#FFF" />
                      <Text style={styles.primaryText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                  {rooms.map((room) => (
                    <View key={room.id} style={[styles.roomItem, { borderColor: activeTheme.border }]}>
                      <View style={styles.roomLeft}>
                        <Ionicons name="radio-outline" size={16} color={Theme.brand.primary} />
                        <Text style={[styles.roomTopic, { color: activeTheme.text }]}>{room.topic}</Text>
                      </View>
                      <View style={[styles.roomBadge, { backgroundColor: room.live ? '#34C759' : activeTheme.border }]}>
                        <Text style={styles.roomBadgeText}>{room.live ? 'Live' : 'Idle'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            }

            return (
              <View key="focus" style={[styles.sectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Focus Mode</Text>
                <View style={styles.focusRow}>
                  <View>
                    <Text style={[styles.focusTitle, { color: activeTheme.text }]}>Deep work mode</Text>
                    <Text style={[styles.focusSub, { color: activeTheme.textMuted }]}>Silence distractions while you learn.</Text>
                  </View>
                  <Switch
                    value={focusMode}
                    onValueChange={setFocusMode}
                    trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <View style={styles.focusChips}>
                  {['25 min', '45 min', '90 min'].map((t) => (
                    <View key={t} style={[styles.focusChip, { backgroundColor: activeTheme.background }]}>
                      <Text style={[styles.focusChipText, { color: activeTheme.text }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  headerSpacer: { width: 36 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  heroCard: { borderRadius: 20, borderWidth: 1, padding: 16, overflow: 'hidden', marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '800' },
  heroSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sectionHint: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  qaBubbleStack: { gap: 8 },
  qaBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },
  qaBubbleUser: { alignSelf: 'flex-end', borderWidth: 0 },
  qaBubbleBot: { alignSelf: 'flex-start' },
  qaText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  qaInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  qaInput: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontWeight: '600' },
  qaSend: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qaChips: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  qaChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  qaChipText: { fontSize: 11, fontWeight: '700' },
  input: { minHeight: 90, borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 13, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  primaryText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  secondaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  secondaryText: { fontSize: 12, fontWeight: '700' },
  outputBox: { marginTop: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  outputText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  flashGrid: { marginTop: 12, gap: 10 },
  flashCard: { borderRadius: 14, borderWidth: 1, padding: 12 },
  flashQ: { fontSize: 13, fontWeight: '700' },
  flashA: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  flashHint: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  roomRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  roomInput: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, fontSize: 13, fontWeight: '500' },
  roomItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  roomLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomTopic: { fontSize: 13, fontWeight: '700' },
  roomBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  roomBadgeText: { fontSize: 10, fontWeight: '800', color: '#0B3B1F' },
  focusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  focusTitle: { fontSize: 13, fontWeight: '700' },
  focusSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  focusChips: { flexDirection: 'row', gap: 10, marginTop: 12 },
  focusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  focusChipText: { fontSize: 11, fontWeight: '700' },
});
