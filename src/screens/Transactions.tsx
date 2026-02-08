import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Animated,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, MoreVertical, ArrowUp, ArrowDown, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';


// ===== THEME CONSTANTS =====
const COLORS = {
  background: '#000000',
  card: '#1a1a1a',
  cardDark: '#0d0d0d',
  border: '#2a2a2a',
  white: '#ffffff',
  gray: '#9DA3AF',
  darkGray: '#1f1f1f',
  income: '#10b981',
  expense: '#f43f5e',
  primary: '#3b82f6',
  lightGray: '#2a2a2a',
  textSecondary: '#8F8F91',
};

const { width } = Dimensions.get('window');

// ===== MAIN COMPONENT =====
export default function TransactionsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
 const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
const [transactions, setTransactions] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hasAnimatedRef.current = false; 
    await fetchTransactions();
    setRefreshing(false);
  }, []);

const getDateLabel = (isoDate: string) => {
    const d = new Date(isoDate);
    const today = new Date();
    
    const comparisonDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayDate = todayDate - 86400000;

    if (comparisonDate === todayDate) return 'TODAY';
    if (comparisonDate === yesterdayDate) return 'YESTERDAY';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  };

  const getTimeLabel = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  // 🔑 animation flag (REF – does not rerender)
  const hasAnimatedRef = useRef(false);

  // Sample transactions data
 
  // 🔥 reset ONLY when screen is entered / exited
useFocusEffect(
  useCallback(() => {
    hasAnimatedRef.current = false;
    fetchTransactions();

    return () => {
      hasAnimatedRef.current = false;
    };
  }, [])
);

const fetchTransactions = async () => {
  try {
    setLoading(true);

    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    console.log('🧑 userId from storage:', userId);
    console.log('🔐 token from storage:', token);

    const res = await API.get(`/user/transaction/${userId}`);

    console.log('📥 FULL TRANSACTIONS RESPONSE:', res.data);

    const apiData = (res.data?.data || []).sort(
  (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
);


    console.log('📦 TRANSACTIONS ARRAY:', apiData);
    console.log('📦 LENGTH:', apiData.length);

  const formatted = apiData.map((item: any) => {
  const isIncome = item.type === 'Income';

  const description =
    item.description ||
    item.note ||
    item.remarks ||
    '';

  const categoryName = isIncome
    ? item.incomeCategoryName
    : item.expenseCategoryName;

  const title =
    description && description.trim().length > 0
      ? description
      : categoryName;

  return {
    id: item._id,
    title, // 🔥 FINAL TITLE
    amount: item.amount.toString(),
    type: isIncome ? 'income' : 'expense',
    category: categoryName?.toUpperCase(),
    time: getTimeLabel(item.date),
    rawDate: item.date,
    dateLabel: getDateLabel(item.date),
    timestamp: new Date(item.date).getTime(),
  };
});

    console.log('✅ FORMATTED TRANSACTIONS:', formatted);

    setTransactions(formatted);
    hasAnimatedRef.current = false;
  } catch (err) {
    console.log('❌ Fetch transactions failed:', err);
  } finally {
    setLoading(false);
  }
};

const filteredTransactions = transactions.filter(tx => {
    // 1. Filter by Tab
    const matchesTab = activeTab === 'all' || tx.type === activeTab;

    // 2. Filter by Search Query (Title or Category)
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

// 1. Group transactions by day
const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
  const date = new Date(tx.rawDate);
  // Create a local midnight timestamp for the group key
  const dayTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  if (!groups[dayTimestamp]) {
    groups[dayTimestamp] = {
      label: tx.dateLabel,
      timestamp: dayTimestamp,
      items: [],
    };
  }

  groups[dayTimestamp].items.push(tx);
  return groups;
}, {} as Record<number, { label: string; timestamp: number; items: any[] }>);

// 2. Sort the Groups with PRIORITY
const sortedGroupedTransactions = Object.values(groupedTransactions).sort((a, b) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  // PRIORITY 1: Today
  if (a.timestamp === todayStart) return -1;
  if (b.timestamp === todayStart) return 1;

  // PRIORITY 2: Yesterday
  if (a.timestamp === yesterdayStart) return -1;
  if (b.timestamp === yesterdayStart) return 1;

  // OTHERWISE: Normal descending order
  return b.timestamp - a.timestamp;
});

// 3. Sort Items within each group by time (Newest first)
sortedGroupedTransactions.forEach(group => {
  group.items.sort((a, b) => b.timestamp - a.timestamp);
});

  const TransactionItem = React.memo(({ tx, index, isSelected }: any) => {
   const opacity = useRef(
  new Animated.Value(hasAnimatedRef.current ? 1 : 0)
).current;

const scale = useRef(
  new Animated.Value(hasAnimatedRef.current ? 1 : 0.8)
).current;

const leftTranslateX = useRef(
  new Animated.Value(hasAnimatedRef.current ? 0 : width * 0.3)
).current;

const rightTranslateX = useRef(
  new Animated.Value(hasAnimatedRef.current ? 0 : -width * 0.3)
).current;


    useEffect(() => {
      // ❌ do NOT re-animate on tab/search/press
      if (hasAnimatedRef.current) {
        opacity.setValue(1);
        scale.setValue(1);
        leftTranslateX.setValue(0);
        rightTranslateX.setValue(0);
        return;
      }

      const delay = index * 100;

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(leftTranslateX, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(rightTranslateX, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      ]).start(() => {
        hasAnimatedRef.current = true;
      });
    }, []);

    return (
      <Animated.View style={[styles.txCard, isSelected && styles.txCardSelected, { opacity, transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.txCardTouchable}
          onPress={() => setSelectedTxId(tx.id)}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.txLeft, { transform: [{ translateX: leftTranslateX }] }]}>
            <View style={[styles.txIconBg, { backgroundColor: tx.type === 'income' ? '#0f201a' : '#1f0f0f' }]}>
              {tx.type === 'income'
                ? <ArrowUpRight size={22} color={COLORS.income} strokeWidth={2} />
                : <ArrowDownLeft size={22} color={COLORS.expense} strokeWidth={2} />}
            </View>

            <View style={styles.txDetails}>
              <Text style={[styles.txTitle, isSelected && styles.txTitleSelected]}>{tx.title}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.txRight, { transform: [{ translateX: rightTranslateX }] }]}>
            <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#10B981' : 'white' }]}>
              {tx.type === 'income' ? '+ ' : '- '}₹{tx.amount}
            </Text>
            <View style={styles.txCategoryRow}>
              <View style={[styles.dot, { backgroundColor: tx.type === 'income' ? COLORS.income : COLORS.expense }]} />
              <Text style={styles.txCategory}>{tx.category}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.gray} style={styles.searchIcon} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by note or category..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Horizontal Tabs without Animation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && styles.activeTab
          ]}
          onPress={() => setActiveTab('all')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'all' && (
              <Check size={12} color="black" strokeWidth={4} style={styles.checkIcon} />
            )}
            <Text style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText
            ]}>
              ALL ACTIVITY
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'income' && styles.activeTab
          ]}
          onPress={() => setActiveTab('income')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'income' && (
              <Check size={14} color="black" strokeWidth={4} style={styles.checkIcon} />
            )}
            <Text style={[
              styles.tabText,
              activeTab === 'income' && styles.activeTabText
            ]}>
              INCOME
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expense' && styles.activeTab
          ]}
          onPress={() => setActiveTab('expense')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'expense' && (
              <Check size={14} color="black" strokeWidth={4} style={styles.checkIcon} />
            )}
            <Text style={[
              styles.tabText,
              activeTab === 'expense' && styles.activeTabText
            ]}>
              EXPENSES
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
     <ScrollView
  style={styles.scrollView}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={COLORS.primary} // For iOS
      colors={[COLORS.primary]}   // For Android
      progressBackgroundColor={COLORS.card}
    />
  }
>
 {loading && !refreshing && (
  <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 40 }}>
    Loading transactions...
  </Text>
)}

  {!loading && Object.keys(groupedTransactions).length === 0 && (
    <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 40 }}>
      No transactions found
    </Text>
  )}

 {!loading &&
  sortedGroupedTransactions.map(group => (
    <View key={group.label} style={styles.dateSection}>
      <Text style={styles.dateHeader}>{group.label}</Text>

      {group.items.map((tx, index) => (
        <TransactionItem
          key={tx.id}
          tx={tx}
          index={index}
          isSelected={selectedTxId === tx.id}
        />
      ))}
    </View>
  ))}

</ScrollView>

    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Outfit-Black',
    letterSpacing: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080808',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 24,
    height: 48,
    borderColor: "#151515",
    borderWidth: 1
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#9DA3AF",
    fontSize: 14,
    fontFamily: 'Outfit-SemiBold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 7,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: "#151515",
    borderWidth: 1,
    minWidth: 40, 
  },
  activeTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100, 
    paddingHorizontal: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  checkIcon: {
    marginRight:2,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Outfit-Black',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  activeTabText: {
    color: "black",
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Outfit-Black',
    marginBottom: 12,
    letterSpacing: 1,
  },
  txCard: { 
    backgroundColor: "#080808", 
    borderRadius: 12, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#151515",
    overflow: 'hidden',
    
  },
  txCardTouchable: {
    padding: 14,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  txCardSelected: {
    backgroundColor: '#0f0f0f',
    borderColor: '#272727',
    borderWidth: 1,
  },
  txLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 18,
    flex: 1,
    overflow: 'hidden',
  },
  txIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
    overflow: 'hidden',
  },
  txTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 3,
    fontFamily: 'Outfit-SemiBold',
    flexShrink: 1,
  },
  txTitleSelected: {
    color: '#356fcf',
  },
  txTime: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '300',
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1,
    flexShrink: 1,
  },
  txRight: { 
    alignItems: 'flex-end',
    marginLeft: 10,
    overflow: 'hidden',
    minWidth: 0,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom:3,
    fontFamily: 'Outfit-SemiBold',
    textAlign: 'right',
    flexShrink: 1,
  },
  txCategoryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 7,
    flexShrink: 1,
  },
  dot: { 
    width: 7, 
    height: 7, 
    borderRadius: 4,
  },
  txCategory: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Outfit-ExtraBold',
    flexShrink: 1,
  },
});