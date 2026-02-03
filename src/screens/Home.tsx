import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Animated } from 'react-native';
import { ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft, Users, Square, Home, List, BarChart3, User } from 'lucide-react-native';
import phoneIcon from '../assets/phone.png';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

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
  purple: '#8b5cf6',
};
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

// ===== MAIN COMPONENT =====
export default function HomeScreen({ navigation }: any) {
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [selectedStatBox, setSelectedStatBox] = useState<'income' | 'expense' | null>(null);

  // Create separate animated values for each section
  const headerOpacity = useState(new Animated.Value(0))[0];
  const balanceCardOpacity = useState(new Animated.Value(0))[0];
  const balanceCardY = useState(new Animated.Value(30))[0];
  const quickActionsOpacity = useState(new Animated.Value(0))[0];
  const quickActionsY = useState(new Animated.Value(20))[0];
  const recentHeaderOpacity = useState(new Animated.Value(0))[0];
  const recentHeaderY = useState(new Animated.Value(15))[0];
  const tx1Opacity = useState(new Animated.Value(0))[0];
  const tx1Y = useState(new Animated.Value(10))[0];
  const tx2Opacity = useState(new Animated.Value(0))[0];
  const tx2Y = useState(new Animated.Value(10))[0];

  const transactions = [
    { id: 1, title: 'Salary', amount: 78980, type: 'income' as const, category: 'SALARY', time: 'JAN 12 • 10:03 AM' },
    { id: 2, title: 'Dinner', amount: 1500, type: 'expense' as const, category: 'FOOD', time: 'JAN 11 • 09:38 PM' },
  ];

  useEffect(() => {
    // Staggered animation sequence
    const animateSequence = () => {
      // Reset all animations
      headerOpacity.setValue(0);
      balanceCardOpacity.setValue(0);
      balanceCardY.setValue(30);
      quickActionsOpacity.setValue(0);
      quickActionsY.setValue(20);
      recentHeaderOpacity.setValue(0);
      recentHeaderY.setValue(15);
      tx1Opacity.setValue(0);
      tx1Y.setValue(10);
      tx2Opacity.setValue(0);
      tx2Y.setValue(10);

      // Header animation (fade in only)
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Balance card animation (fade in + slide up) after delay
      Animated.parallel([
        Animated.timing(balanceCardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(balanceCardY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Quick actions animation (fade in + slide up) after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(quickActionsOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(quickActionsY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      // Recent activity header animation after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(recentHeaderOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recentHeaderY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, 350);

      // Transaction 1 animation after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(tx1Opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(tx1Y, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, 450);

      // Transaction 2 animation after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(tx2Opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(tx2Y, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, 550);
    };

    // Start animation sequence
    animateSequence();

    // Add focus listener to replay animation when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      animateSequence();
    });

    return unsubscribe;
  }, [navigation]);

  const renderTransactionIcon = (type: 'income' | 'expense') => {
    if (type === 'income') {
      return <ArrowUpRight size={20} color={COLORS.income} strokeWidth={2} />;
    } else {
      return <ArrowDownLeft size={20} color={COLORS.expense} strokeWidth={2} />;
    }
  };

  const getIconBackgroundColor = (type: 'income' | 'expense') => {
    return type === 'income' ? "#0f201a" : "#1f0f0f";
  };

  const getDotColor = (type: 'income' | 'expense') => {
    return type === 'income' ? COLORS.income : COLORS.expense;
  };

  const getAmountColor = (type: 'income' | 'expense') => {
    return type === 'income' ? "#10B981" : "white";
  };

  const getAmountPrefix = (type: 'income' | 'expense') => {
    return type === 'income' ? '+ ' : '- ';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          { opacity: headerOpacity }
        ]}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>Alex Morgan</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' }}
            style={styles.profilePic}
          />
        </Animated.View>

        {/* Balance Card */}
        <Animated.View style={[
          styles.balanceCard,
          {
            opacity: balanceCardOpacity,
            transform: [{ translateY: balanceCardY }]
          }
        ]}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <MaskedView
            maskElement={
              <Text style={styles.totalBalance} >
                
                ₹{formatCurrency(71280)}
              </Text>
            }
          >
            <LinearGradient
              colors={['#ffffff', '#d9d9d9', '#8a8a8a', '#2a2a2a']}
              locations={[0, 0.3, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={[styles.totalBalance, { opacity: 0 }]}>
                ₹71280.00
              </Text>
            </LinearGradient>
          </MaskedView>

          <View style={styles.statsRow}>
            {/* Income Box */}
            <TouchableOpacity
              style={[
                styles.statBox,
                selectedStatBox === 'income' && styles.statBoxSelected
              ]}
              onPress={() => setSelectedStatBox('income')}
              activeOpacity={0.9}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={styles.incomeIconBox}>
                    <ArrowUp size={14} color={COLORS.income} strokeWidth={3} />
                  </View>
                  <Text style={styles.statLabel}>INCOME</Text>
                </View>
               <Text style={styles.incomeAmount}>
  ₹{formatCurrency(10446788)}
</Text>

              </View>
            </TouchableOpacity>

            {/* Expense Box */}
            <TouchableOpacity
              style={[
                styles.statBox,
                selectedStatBox === 'expense' && styles.statBoxSelected
              ]}
              onPress={() => setSelectedStatBox('expense')}
              activeOpacity={0.9}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={styles.expenseIconBox}>
                    <ArrowDown size={14} color={COLORS.expense} strokeWidth={3} />
                  </View>
                  <Text style={styles.statLabel}>EXPENSES</Text>
                </View>
                <Text style={styles.expenseAmount}>
  ₹{formatCurrency(33287800)}
</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[
          { opacity: quickActionsOpacity, transform: [{ translateY: quickActionsY }] }
        ]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Income')}
              activeOpacity={0.8}
            >
              <View style={styles.incomeActionBtn}>
                <ArrowUpRight size={28} color={COLORS.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.actionLabel}>INCOME</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Expense')} activeOpacity={0.8}>
              <View style={styles.expenseActionBtn}>
                <ArrowDownLeft size={28} color={COLORS.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.actionLabel}>EXPENSE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() =>
              navigation.navigate('SplitTab', {
                screen: 'SplitMain',
              })
            }
            >
              <View style={styles.splitActionBtn}>

                <Users size={28} color={COLORS.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.actionLabel}>SPLIT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Activity Section Header */}
        <Animated.View style={[
          styles.sectionHeader,
          {
            opacity: recentHeaderOpacity,
            transform: [{ translateY: recentHeaderY }]
          }
        ]}>
          <Text style={styles.sectionTitleRecent}>Recent Activity</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transaction Cards */}
        {transactions.map((tx, index) => {
          const opacityAnim = index === 0 ? tx1Opacity : tx2Opacity;
          const translateYAnim = index === 0 ? tx1Y : tx2Y;

          return (
            <Animated.View
              key={tx.id}
              style={[
                {
                  opacity: opacityAnim,
                  transform: [{ translateY: translateYAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.txCard,
                  selectedTxId === tx.id && styles.txCardSelected
                ]}
                onPress={() => setSelectedTxId(tx.id)}
                activeOpacity={0.7}
              >
                <View style={styles.txLeft}>
                  <View style={[
                    styles.txIconBg,
                    { backgroundColor: getIconBackgroundColor(tx.type) }
                  ]}>
                    {renderTransactionIcon(tx.type)}
                  </View>

                  <View>
                    <Text style={[
                      styles.txTitle,
                      selectedTxId === tx.id && styles.txTitleSelected
                    ]}>
                      {tx.title}
                    </Text>
                    <Text style={styles.txTime}>{tx.time}</Text>
                  </View>
                </View>

                <View style={styles.txRight}>
                 <Text style={[styles.txAmount, { color: getAmountColor(tx.type) }]}>
  {getAmountPrefix(tx.type)}₹{formatCurrency(tx.amount)}
</Text>

                  <View style={styles.txCategoryRow}>
                    <View style={[
                      styles.dot,
                      { backgroundColor: getDotColor(tx.type) }
                    ]} />
                    <Text style={[
                      styles.txCategory,
                      selectedTxId === tx.id && styles.txCategorySelected
                    ]}>
                      {tx.category}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
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

  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 50,
    marginBottom: 32,
  },

  welcome: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'Outfit-Regular',
  },

  name: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Outfit-Black',
    letterSpacing: -0.5,
  },

  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  balanceCard: {
    backgroundColor: "#08090b",
    padding: 20,
    borderRadius: 32,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#202020",
  },

  balanceLabel: {
    color: 'hsl(220, 10%, 65%)',
    opacity: 0.7,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 5,
    fontFamily: 'Outfit-Black',
  },

  totalBalance: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 26,
    fontFamily: 'Outfit-Black',
    letterSpacing: -1,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#131313",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statBoxSelected: {
    backgroundColor: "#1a1a1a",
  },

  statContent: {
    flexDirection: 'column',
    gap: 5,
  },

  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  incomeIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.income + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  expenseIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.expense + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statLabel: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Outfit-SemiBold',
  },

  incomeAmount: {
    color: "white",
    fontSize: 17,
    fontWeight: '300',
    fontFamily: 'Outfit-Black',
  },

  expenseAmount: {
    color: "white",
    fontSize: 17,
    fontWeight: '300',
    fontFamily: 'Outfit-Black',
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 20,
    fontFamily: 'Outfit-Black',
    letterSpacing: 0
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },

  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },

  incomeActionBtn: {
    width: 62,
    height: 62,
    borderRadius: 29,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#10B981"
  },

  expenseActionBtn: {
    width: 62,
    height: 62,
    borderRadius: 29,
    backgroundColor: "#F43F5E",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  splitActionBtn: {
    width: 62,
    height: 62,
    borderRadius: 29,
    backgroundColor: "#8B5CF6",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  actionLabel: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Outfit-Black',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },

  sectionTitleRecent: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: 'Outfit-Black',
    letterSpacing: 0
  },

  viewAllBtn: {
    backgroundColor: "#1e427d" + '30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 24,
  },

  viewAllText: {
    color: "#3c83f6",
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Outfit-Black',
  },

  txCard: {
    backgroundColor: "#080808",
    padding: 16,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#151515",
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
  },

  txIconBg: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  txTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 2,
    fontFamily: 'Outfit-SemiBold',
  },

  txTitleSelected: {
    color: '#356fcf',
  },

  txTime: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '300',
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1
  },

  txRight: {
    alignItems: 'flex-end',
  },

  txAmount: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'Outfit-SemiBold',
  },

  txCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  txCategory: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Outfit-ExtraBold',
  },

});