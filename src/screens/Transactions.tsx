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
  Dimensions
} from 'react-native';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, MoreVertical, ArrowUp, ArrowDown, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

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
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  // 🔑 animation flag (REF – does not rerender)
  const hasAnimatedRef = useRef(false);

  // Sample transactions data
  const transactions = [
    { id: 1, title: 'Salary', amount: '78980', type: 'income' as const, category: 'SALARY', time: 'JAN 12 • 10:03 AM', date: 'TODAY', dateGroup: 'today' },
    { id: 2, title: 'Dinner', amount: '1500', type: 'expense' as const, category: 'FOOD', time: 'JAN 11 • 09:38 PM', date: 'TODAY', dateGroup: 'today' },
    { id: 3, title: 'Salary', amount: '8980', type: 'income' as const, category: 'SALARY', time: '12:32 PM', date: 'YESTERDAY', dateGroup: 'yesterday' },
    { id: 4, title: 'Salary', amount: '500', type: 'income' as const, category: 'SALARY', time: '08:38 AM', date: 'YESTERDAY', dateGroup: 'yesterday' },
    { id: 5, title: 'Salary', amount: '5000', type: 'income' as const, category: 'SALARY', time: '03:38 PM', date: 'JAN 10, 2026', dateGroup: 'jan10' },
    { id: 6, title: 'Business', amount: '100', type: 'income' as const, category: 'BUSINESS', time: '12:17 PM', date: 'TODAY', dateGroup: 'today' },
    { id: 7, title: 'Rapido', amount: '250', type: 'income' as const, category: 'TRANSPORT', time: '10:03 AM', date: 'TODAY', dateGroup: 'today' },
  ];

  // 🔥 reset ONLY when screen is entered / exited
  useFocusEffect(
    useCallback(() => {
      hasAnimatedRef.current = false;
      return () => {
        hasAnimatedRef.current = false;
      };
    }, [])
  );

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'income') return tx.type === 'income';
    if (activeTab === 'expense') return tx.type === 'expense';
    return true;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    if (!groups[transaction.date]) groups[transaction.date] = [];
    groups[transaction.date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

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
      >
        {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            {dateTransactions.map((tx, index) => (
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