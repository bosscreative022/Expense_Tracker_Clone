import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Dimensions, Easing, StatusBar
} from 'react-native';
import { Search, Clock, Wallet, Users, ChevronRight, Plus } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllSplitGroups } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width } = Dimensions.get('window');



const COLORS = {
  bg: '#000000',
  card: '#080808',
  border: '#151515',
  textSecondary: '#535353',
  pending: '#f59e0b',
  collected: '#10b981',
  white: '#FFFFFF',
};

// ===== ANIMATED PROGRESS CIRCLE =====
const AnimatedProgressCircle = ({ percentage, color }: { percentage: number; color: string }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = 50;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.circleContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#1a1a1a"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.percentageTextContainer}>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ===== ANIMATED BODY CARD =====
const SplitCard = ({ item, index }: { item: any; index: number }) => {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('GroupOverview', {
          id: item.id,
         groupName: item.title,
          members: item.members,
          pending: item.pending,
          collected: item.collected,
          progress: item.progress,
        })
      }
    >
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.cardLeft}>
          <AnimatedProgressCircle
            percentage={item.progress}
            color={item.progress === 100 ? COLORS.collected : COLORS.white}
          />

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>

            <View style={styles.memberRow}>
              <Users size={10} color={COLORS.textSecondary} />
              <Text style={styles.memberText}>{item.members} MEMBERS</Text>
            </View>

            <View style={styles.amountRow}>
              {item.pending > 0 && (
                <View style={styles.amountGroup}>
                  <Clock size={10} color="#F59E0B" />
                  <Text style={styles.amountVal}>
                    ₹{item.pending.toLocaleString()}
                  </Text>
                </View>
              )}

              {item.collected > 0 && (
                <View style={styles.amountGroup}>
                  <Wallet size={10} color="#0d704e" />
                  <Text style={styles.amountVal}>
                    ₹{item.collected.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <ChevronRight size={16} color="#2a2a2a" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};


// ===== MAIN SCREEN =====
export default function SplitScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('ALL');
const [splits, setSplits] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');

useFocusEffect(
  React.useCallback(() => {
    fetchSplits();
  }, [])
);


const fetchSplits = async () => {
  try {
    setLoading(true);
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      setSplits([]);
      return;
    }

    const res = await getAllSplitGroups(userId);
    const apiData = res.data?.data || [];

    const formatted = apiData.map((group: any) => {
      const total = Number(group.totalAmount || 0);

      // 1. Calculate collected using "status === 'settled'" and "m.amount"
      const collected = (group.members || [])
        .filter((m: any) => m.status === 'settled') // Backend uses 'status'
        .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0); // Backend uses 'amount'

      const pending = total - collected;
      const progress = total === 0 ? 0 : Math.round((collected / total) * 100);

      return {
        id: group.id || group._id,
        title: group.name,
        members: group.members?.length || 0,
        pending,
        collected,
        progress,
        // Using total logic to determine status
        status: pending <= 0 ? 'SETTLED' : 'PENDING',
      };
    });

    setSplits(formatted);
  } catch (err: any) {
    console.log('GET SPLITS ERROR:', err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};


// 1. Calculate stats based on the full list of splits
const stats = React.useMemo(() => {
  return splits.reduce(
    (acc, curr) => {
      acc.totalPending += curr.pending;
      acc.totalCollected += curr.collected;
      return acc;
    },
    { totalPending: 0, totalCollected: 0 }
  );
}, [splits]);

// 2. Filter data based on BOTH Tab and Search Query
const filteredData = React.useMemo(() => {
  return splits.filter((item) => {
    // Check if it matches the current tab
    const matchesTab = activeTab === 'ALL' || item.status === activeTab;
    
    // Check if it matches the search query (case-insensitive)
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });
}, [splits, activeTab, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{ paddingBottom: 40 }}
keyboardShouldPersistTaps="handled"
>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>EXPENSE MANAGEMENT</Text>
            <Text style={styles.headerTitle}>Split</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('Step1')}
          >
            <Plus size={18} color={COLORS.white} />
          </TouchableOpacity>

        </View>

        <View style={styles.searchBox}>
  <Search size={16} color={COLORS.textSecondary} />
  <TextInput
    placeholder="Search splits, members..."
    placeholderTextColor={COLORS.textSecondary}
    style={styles.searchInput}
    value={searchQuery} // Add this
    onChangeText={setSearchQuery} // Add this
    autoCapitalize="none"
  />
</View>
<View style={styles.statsRow}>
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconBg, { backgroundColor: '#201708' }]}>
        <Clock size={16} color="#F59E0B" />
      </View>
      <Text style={styles.statLabel}>PENDING</Text>
    </View>
    {/* Updated Value */}
    <Text style={styles.statValue}>
      ₹{stats.totalPending.toLocaleString('en-IN')}
    </Text>
  </View>
  
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconBg, { backgroundColor: '#091a14' }]}>
        <Wallet size={16} color="#0eac78" />
      </View>
      <Text style={styles.statLabel}>COLLECTED</Text>
    </View>
    {/* Updated Value */}
    <Text style={styles.statValue}>
      ₹{stats.totalCollected.toLocaleString('en-IN')}
    </Text>
  </View>
</View>

        <View style={styles.tabContainer}>
          {['ALL', 'PENDING', 'SETTLED'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

      <View style={styles.listContainer}>
  {filteredData.map((item, index) => (
    <SplitCard key={item.id} item={item} index={index} />
  ))}
</View>
{!loading && filteredData.length === 0 && (
    <View style={{ alignItems: 'center', marginTop: 40 }}>
      <Search size={40} color={COLORS.border} />
      <Text style={{ color: '#666', marginTop: 10, fontFamily: 'Outfit-Bold' }}>
        No splits found for "{searchQuery}"
      </Text>
    </View>
  )}

</ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20, alignItems: 'center' },
  headerLabel: { color: "#666666", fontSize: 10, fontFamily: 'Outfit-Bold', letterSpacing: 1.5 },
  headerTitle: { color: COLORS.white, fontSize: 30, fontFamily: 'Outfit-Bold', marginTop: 4 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', backgroundColor: "#080808", marginHorizontal: 24, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', paddingVertical: 5 },
  searchInput: { flex: 1, color: COLORS.white, marginLeft: 10, fontFamily: 'Inter_18pt-Bold', fontSize: 14 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: "#080808", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconBg: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit-Bold' },
  statValue: { color: COLORS.white, fontSize: 20, fontFamily: 'Outfit-Black' },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 4,
    backgroundColor: "#080808"
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: COLORS.white },
  tabText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: 'Outfit-Black' },
  tabTextActive: { color: COLORS.bg },
  listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { backgroundColor: COLORS.card, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  circleContainer: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  percentageTextContainer: { position: 'absolute' },
  percentageText: { fontSize: 10, fontFamily: 'Outfit-SemiBold', color: COLORS.white },
  cardInfo: { marginLeft: 16, flex: 1 },
  cardTitle: { color: COLORS.white, fontSize: 14, fontFamily: 'Outfit-SemiBold' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  memberText: { color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Inter_18pt-Bold', marginLeft: 2 ,},
  amountRow: { flexDirection: 'row', marginTop: 10, gap: 12 },
  amountGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountVal: { color: "white", fontSize: 12, fontFamily: 'Outfit-Black' },
  chevronWrap: {
    alignSelf: 'flex-start',
    marginTop: 6, // 👈 adjust (4–8) to match exactly
  },

});