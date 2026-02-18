import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Animated, StatusBar, Easing, Dimensions
} from 'react-native';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Target, 
  ArrowUp, ArrowDown, Check, ShoppingBag, 
  Home, CreditCard, ShoppingBasket,
  Utensils, Tv, Coffee, Briefcase, Users,
  ArrowUpRight, ArrowDownLeft, Clock,
  CircleCheckBig, Plus, HelpCircle,
  Car,
  House,
  HeartPulse,
  Dumbbell,
  Zap,
  Gift,
  Coins,
  TrendingDown
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#000000',
  cardBg: '#080808',
  cardBorder: '#151515',
  textMain: '#FFFFFF',
  textSecondary: '#9DA3AF',
  income: '#34D399', 
  expense: '#f43f5e', 
  cyan: '#22d3ee',
  purpleChart: '#a78bfa',
  gold: '#fbbf24',
  emerald: '#10B981',
  gray: '#4B5563',
  navBtn: '#181818'
};
const DONUT_DATA = [
  { label: 'Shopping', percent: 60, color: COLORS.cyan },
  { label: 'Rent', percent: 20, color: COLORS.purpleChart },
  { label: 'Split', percent: 12, color: COLORS.gold },
  { label: 'Grocery', percent: 8, color: COLORS.emerald },
];
const filterByMonth = (data, date) => {
  if (!data) return [];
  const month = date.getMonth();
  const year = date.getFullYear();
  return data.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [transactions, setTransactions] = useState([]);
  
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); 
  });

  const [summary, setSummary] = useState({
    totalIn: 0, totalOut: 0, netFlow: 0, savingsPercent: 0, dailyAvg: 0,
  });

  const [splitSummary, setSplitSummary] = useState({
    toRecover: 0, received: 0, yourShare: 0, totalGroups: 0, activeGroups: 0, doneGroups: 0,
  });
const dynamicWeeklyTrend = React.useMemo(() => {
  const weeks = [
    { label: 'W1', in: 0, out: 0 },
    { label: 'W2', in: 0, out: 0 },
    { label: 'W3', in: 0, out: 0 },
    { label: 'W4', in: 0, out: 0 },
    { label: 'W5', in: 0, out: 0 },
  ];

  const monthlyData = filterByMonth(transactions, currentDate);

  // 1. Process regular transactions
  monthlyData.forEach(t => {
    const day = new Date(t.date).getDate();
    const amount = parseFloat(t.amount) || 0;
    let weekIdx = Math.min(Math.floor((day - 1) / 7), 4);

    const type = t.type?.toLowerCase();
    if (type === 'income') weeks[weekIdx].in += amount;
    else if (type === 'expense' || type === 'split') weeks[weekIdx].out += amount;
  });

  // 2. Inject the second API source (Split Received)
  // Since received splits might not have individual dates in the summary, 
  // we add them to the current week of the month so the "Total In" matches.
  const now = new Date();
  const isCurrentMonth = currentDate.getMonth() === now.getMonth() && 
                         currentDate.getFullYear() === now.getFullYear();
  
  if (isCurrentMonth && splitSummary.received > 0) {
    const currentWeekIdx = Math.min(Math.floor((now.getDate() - 1) / 7), 4);
    weeks[currentWeekIdx].in += Number(splitSummary.received);
  }

  // 3. Calculate scaling
  const maxVal = Math.max(...weeks.flatMap(w => [w.in, w.out]), 1);
  const CHART_HEIGHT = 100;
  const scaleFactor = CHART_HEIGHT / (maxVal * 1.1);

  return weeks.map(w => ({
    ...w,
    inHeight: w.in * scaleFactor,
    outHeight: w.out * scaleFactor,
    actualIn: w.in,
    actualOut: w.out
  }));
  
}, [transactions, currentDate, splitSummary.received]); // Added splitSummary as dependency

  useEffect(() => {
  console.log('--- Weekly Trend Debug ---');
  console.log('Month:', currentDate.toLocaleString('default', { month: 'long' }));
  dynamicWeeklyTrend.forEach(week => {
    console.log(`${week.label} -> IN: ₹${week.actualIn}, OUT: ₹${week.actualOut}`);
  });
}, [dynamicWeeklyTrend]);

  // --- Animation Refs ---
  const fadeAnims = useRef([...Array(12)].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([...Array(12)].map(() => new Animated.Value(30))).current;
  
  // Updated barAnims to 6 slots for safety
  const barAnims = useRef([...Array(6)].map(() => ({ 
    in: new Animated.Value(0), 
    out: new Animated.Value(0) 
  }))).current;

  const segmentAnims = useRef(DONUT_DATA.map(() => new Animated.Value(0))).current;
  const progressAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  // --- Logic & Fetching ---
const fetchTransactions = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const res = await API.get(`/user/transaction/${userId}`);
    if (res.data.success) {
      console.log('Fetched transactions:', res.data.data);
      setTransactions(res.data.data);
    }
  } catch (err) { console.log("Transaction Fetch Error:", err); }
};

  const fetchSplitSummary = async () => {
    
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      const res = await API.get(`/user/split/${userId}`);
      if (res.data.success) {
        const allGroups = res.data.data || [];
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const filteredGroups = allGroups.filter(group => {
          const groupDate = new Date(group.createdAt || group.date);
          return groupDate.getMonth() === currentMonth && groupDate.getFullYear() === currentYear;
        });

        let toRecover = 0, received = 0, yourShare = 0, activeGroups = 0, doneGroups = 0;
        filteredGroups.forEach(group => {
          const members = group.members || [];
          const myEntry = members.find(m => m.id === userId || m.name === "You");
          if (myEntry) yourShare += Number(myEntry.amount || 0);

          let isGroupFullySettled = true;
          members.forEach(member => {
            const isMe = member.id === userId || member.name === "You";
            if (!isMe) {
              const amt = Number(member.amount || 0);
              if (member.status === 'settled' || member.status === 'paid') received += amt;
              else { toRecover += amt; isGroupFullySettled = false; }
            }
          });
          isGroupFullySettled ? doneGroups++ : activeGroups++;
        });

        const totalVolume = toRecover + received;
        setSplitSummary({
          toRecover, received, yourShare, totalGroups: filteredGroups.length,
          activeGroups, doneGroups, completionPercent: totalVolume > 0 ? Math.round((received / totalVolume) * 100) : 0
        });
      }
    } catch (err) { console.log("Split Summary Fetch Error:", err.message); }
  };

const calculateSummary = (data = [], splitData = {}) => {
  let totalIn = 0, totalOut = 0;
  data.forEach((t) => {
    const amount = Number(t.amount) || 0;
    const type = t.type?.toLowerCase();
    if (type === 'income') {
      totalIn += amount;
    } else if (type === 'expense' || type === 'split') {
      totalOut += amount;
    } else {
      // fallback: treat unknown as expense (shouldn't happen)
      totalOut += amount;
    }
  });

  // Add money you've already received from split members
  totalIn += Number(splitData.received) || 0;

  const netFlow = totalIn - totalOut;
  setSummary({
    totalIn,
    totalOut,
    netFlow,
    savingsPercent: totalIn > 0 ? (netFlow / totalIn) * 100 : 0,
    dailyAvg: totalOut / 30,
  });

  console.log('Filtered transactions for month:', data);
  console.log('TotalIn:', totalIn, 'TotalOut:', totalOut);
};

  const processedExpenseData = React.useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
   const monthlyExpenses = transactions.filter(t => {
  const d = new Date(t.date);
  const type = t.type?.toLowerCase();
  return (type === 'expense' || type === 'split') &&
         d.getMonth() === currentMonth &&
         d.getFullYear() === currentYear;
});
    const totalMonthlyVal = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const CATEGORY_CONFIG = [
      { name: 'Food', icon: Utensils, color: '#f97316' },
  { name: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
  { name: 'Transport', icon: Car, color: '#3b82f6' },
  { name: 'Housing', icon: House, color: '#6366f1' },
  { name: 'Entertain', icon: Tv, color: '#f43f5e' },
  { name: 'Health', icon: HeartPulse, color: '#10b981' },
  { name: 'Fitness', icon: Dumbbell, color: '#8b5cf6' },
  { name: 'Grocery', icon: ShoppingBasket, color: '#14b8a6' },
  { name: 'Bills', icon: Zap, color: '#f59e0b' },
  { name: 'Travel', icon: Car, color: '#06b6d4' },
  { name: 'Education', icon: Briefcase, color: '#2563eb' },
  { name: 'Personal', icon: HeartPulse, color: '#db2777' },
  { name: 'Gifts', icon: Gift, color: '#e11d48' },
  { name: 'Rent', icon: Home, color: '#4f46e5' },
   { name: 'Coffee', icon: Coffee, color: '#d97706' },
  { name: 'Insurance', icon: HeartPulse, color: '#ef4444' },
  { name: 'Investment', icon: Coins, color: '#047857' },
  { name: 'Other', icon: Plus, color: '#64748b' },
  { name: 'Split', icon: Users, color: '#3b82f6' },
    ];
   const categoryMap = monthlyExpenses.reduce((acc, t) => {
  let cat = t.category || 'Other';

  // If the type is split, force the category name to 'Split'
  if ((t.type || '').toLowerCase() === 'split') {
    cat = 'Split';
  }

  acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
  return acc;
}, {});
    const formatted = Object.keys(categoryMap).map(catName => {
      const amount = categoryMap[catName];
      const config = CATEGORY_CONFIG.find(c => c.name.toLowerCase() === catName.toLowerCase()) || CATEGORY_CONFIG.find(c => c.name === 'Other');
      return { label: catName, amount, percent: totalMonthlyVal > 0 ? Math.round((amount / totalMonthlyVal) * 100) : 0, color: config.color, icon: config.icon };
    }).sort((a, b) => b.amount - a.amount);

    return { breakdown: formatted, donut: formatted.slice(0, 4), totalCategories: formatted.length, totalSpent: totalMonthlyVal };
  }, [transactions, currentDate]);

const runAnimations = useCallback(() => {
  // --- RESET all animation values ---
  fadeAnims.forEach(anim => anim.setValue(0));
  slideAnims.forEach(anim => anim.setValue(30));
  barAnims.forEach(bar => { bar.in.setValue(0); bar.out.setValue(0); });
  segmentAnims.forEach(anim => anim.setValue(0));
  progressAnims.forEach(anim => anim.setValue(0));

  // --- Entry animations ---
  const popIn = fadeAnims.map((anim, i) =>
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(slideAnims[i], {
        toValue: 0,
        duration: 450,
        useNativeDriver: true
      })
    ])
  );

  // --- Detail Animations ---
  let detailAnims = [];

  if (activeTab === 'OVERVIEW') {
    // Weekly Trend Bars
    detailAnims = dynamicWeeklyTrend.flatMap((item, i) => [
      Animated.timing(barAnims[i].in, {
        toValue: item.inHeight,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false
      }),
      Animated.timing(barAnims[i].out, {
        toValue: item.outHeight,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false
      })
    ]);

  } else if (activeTab === 'EXPENSES') {
    // Donut Segments Animation
    detailAnims = [
      Animated.stagger(
        150,
        segmentAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false
          })
        )
      ),

      // Category Progress Bars
      Animated.stagger(
        100,
        progressAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false
          })
        )
      )
    ];

  } else if (activeTab === 'SPLITS') {
    // Split Progress Bars
    detailAnims = [
      Animated.stagger(
        100,
        progressAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false
          })
        )
      )
    ];
  }

  // --- Run Animations ---
  Animated.sequence([
    Animated.stagger(60, popIn),
    Animated.parallel(detailAnims)
  ]).start();

}, [dynamicWeeklyTrend, activeTab]);

 
useEffect(() => {
  const filtered = filterByMonth(transactions, currentDate);
  calculateSummary(filtered, splitSummary);
}, [currentDate, transactions, splitSummary]); 

  useEffect(() => { runAnimations(); }, [dynamicWeeklyTrend, activeTab, currentDate]);
 
 
   useFocusEffect(useCallback(() => {
     fetchTransactions();
     fetchSplitSummary();
     const interval = setInterval(fetchSplitSummary, 3000);
     return () => clearInterval(interval);
   }, [currentDate]));

 const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount || 0);


  const goToNextMonth = () => {
  setCurrentDate(prev => {
    const next = new Date(prev);
    next.setMonth(next.getMonth() + 1);
    return next;
  });
};
  const goToPrevMonth = () => {
  setCurrentDate(prev => {
    const prevDate = new Date(prev);
    prevDate.setMonth(prevDate.getMonth() - 1);
    return prevDate;
  });
};
  // --- Renders ---
  const renderOverview = () => (
    
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
     <Animated.View
  style={[
    styles.baseCard,
    styles.netFlowCard,
    { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }
  ]}
>
  {/** Determine icon and colors dynamically */}
  {(() => {
    const isNegative = summary.netFlow < 0;
    const IconComponent = isNegative ? TrendingDown : TrendingUp;
    const bgColor = isNegative ? COLORS.expense : COLORS.income;
    const textColor = isNegative ? '#fb7185' : COLORS.income;

    return (
      <View style={styles.netFlowHeader}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <IconComponent color="white" size={20} />
        </View>
        <View>
          <Text style={styles.labelSmall}>NET FLOW</Text>
          <Text style={[styles.valueLarge, { color: summary.netFlow < 0 ? '#FB7185' : COLORS.income }]}>
  {summary.netFlow < 0 ? '-' : '+'}₹{formatCurrency(Math.abs(summary.netFlow))}
</Text>
        </View>
      </View>
    );
  })()}

  <View style={styles.subCardRow}>
    <View style={styles.miniSubCard}>
      <View style={styles.cardContentRow}>
        <View style={[styles.miniIconBox, { backgroundColor: COLORS.income }]}>
          <ArrowUp color="white" size={14} />
        </View>
        <View>
          <Text style={styles.labelSmall}>IN</Text>
          <Text style={styles.valueMedium}>₹{formatCurrency(summary.totalIn)}</Text>
        </View>
      </View>
    </View>
    <View style={styles.miniSubCard}>
      <View style={styles.cardContentRow}>
        <View style={[styles.miniIconBox, { backgroundColor: COLORS.expense }]}>
          <ArrowDown color="white" size={14} />
        </View>
        <View>
          <Text style={styles.labelSmall}>OUT</Text>
          <Text style={styles.valueMedium}>₹{formatCurrency(summary.totalOut)}</Text>
        </View>
      </View>
    </View>
  </View>
</Animated.View>


      <View style={styles.subCardRow}>
      <Animated.View style={[styles.halfCard, { opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }] }]}>
  <View style={styles.cardIconRow}>
    <View style={[styles.iconBoxSmall, { backgroundColor: '#072a30' }]}>
      <TrendingUp color={COLORS.cyan} size={12} />
    </View>
    <Text style={styles.cardLabel}>SAVINGS</Text>
  </View>
  <Text
    style={[
      styles.cardValueLarge,
      { color: summary.savingsPercent < 0 ? '#fb7185': COLORS.income }
    ]}
  >
    {summary.savingsPercent.toFixed(0)}%
  </Text>
</Animated.View>

        <Animated.View style={[styles.halfCard, { opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }]}>
          <View style={styles.cardIconRow}><View style={[styles.iconBoxSmall, { backgroundColor: '#281737' }]}><Target color={COLORS.purpleChart} size={12} /></View><Text style={styles.cardLabel}>DAILY AVG</Text></View>
          <Text style={styles.cardValueLarge}>₹{formatCurrency(summary.dailyAvg)}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.baseCard, styles.chartCard, { opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }]}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>WEEKLY TREND</Text>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: COLORS.income }]} /><Text style={styles.legendText}>IN</Text>
            <View style={[styles.dot, { backgroundColor: COLORS.expense, marginLeft: 8 }]} /><Text style={styles.legendText}>OUT</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {dynamicWeeklyTrend.map((item, i) => (
            <View key={i} style={styles.chartColumn}>
              <View style={styles.barStack}>
                <Animated.View style={[styles.bar, { backgroundColor: COLORS.income, height: barAnims[i].in, minHeight: item.inHeight > 0 ? 2 : 0 }]} />
                <Animated.View style={[styles.bar, { backgroundColor: COLORS.expense, height: barAnims[i].out, minHeight: item.outHeight > 0 ? 2 : 0 }]} />
              </View>
              <Text style={styles.weekText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }}>
        <TouchableOpacity style={styles.recoverCard} activeOpacity={0.7} onPress={() => setActiveTab('SPLITS')}>
          <View style={styles.recoverLeft}>
            <View style={styles.recoverIconBox}><Users color="#fbbf24" size={20} /></View>
            <View><Text style={styles.recoverLabel}>TO RECOVER</Text><Text style={styles.recoverValue}>₹{formatCurrency(splitSummary.toRecover)}</Text></View>
          </View>
          <ChevronRight color="#93A3AF" size={18} />
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );

const renderExpenses = () => {
  const currentDonutData = processedExpenseData.donut;
  const currentBreakdown = processedExpenseData.breakdown;
  const hasData = currentBreakdown.length > 0;
  const size = 120;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const gapDegrees = 4; 
  const totalGapDegrees = gapDegrees * DONUT_DATA.length;
  const availableDegrees = 360 - totalGapDegrees;

  let cumulativeRotation = -180;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.baseCard, styles.donutCard, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
        <Text style={styles.totalSpentLabel}>TOTAL SPENT</Text>
        <Text style={styles.totalSpentValue}>
  ₹{formatCurrency(summary.totalOut)}
</Text>

        <View style={styles.donutWrapper}>
          <View style={[styles.svgContainer, { width: size, height: size }]}>
            <Svg width={size} height={size}>
              <G origin={`${center}, ${center}`} scaleX={-1}>
                <Circle 
                  cx={center} cy={center} r={radius} 
                  stroke="#111" strokeWidth={strokeWidth} fill="transparent" 
                />
                {currentDonutData.map((item, i) => {
                  const segmentDegrees = (item.percent / 100) * availableDegrees;
                  const strokeLength = (segmentDegrees / 360) * circumference;
                  const strokeOffset = circumference - strokeLength;

                  const rotation = cumulativeRotation;
                  cumulativeRotation += (segmentDegrees + gapDegrees);

                  return (
                    <G key={i} rotation={rotation} origin={`${center}, ${center}`}>
                      <AnimatedCircle
                        cx={center} cy={center} r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={segmentAnims[i].interpolate({ 
                          inputRange: [0, 1], 
                          outputRange: [circumference, strokeOffset],
                        })}
                        strokeLinecap="butt" 
                      />
                    </G>
                  );
                })}
              </G>
            </Svg>

            <View style={styles.donutTextContainer}>
              <Text style={styles.donutMainText}>{processedExpenseData.totalCategories}</Text>
              <Text style={styles.donutSubText}>CATEGORIES</Text>
            </View>
          </View>

          <View style={styles.donutLegend}>
            {currentDonutData.slice(0, 5).map((item, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.legendPercent}>{item.percent}%</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      <Text style={styles.sectionHeader}>CATEGORY BREAKDOWN</Text>
{hasData ? (
        currentBreakdown.map((item, i) => (
          <Animated.View 
            key={i} 
            style={[
              styles.baseCard, 
              styles.breakdownCard, 
              { opacity: fadeAnims[i+1] || 1, transform: [{ translateY: slideAnims[i+1] || 0 }] }
            ]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
              <item.icon color="#ffffff" size={20} strokeWidth={2.5} />
            </View>

            <View style={styles.categoryInfo}>
              <View style={styles.categoryTopRow}>
                <Text style={styles.categoryTitle}>{item.label}</Text>
                <Text style={styles.categoryAmount}>₹{formatCurrency(item.amount)}</Text>
              </View>
              
              <View style={styles.progressRow}>
                <View style={styles.progressBarContainer}>
                  <Animated.View style={[styles.progressBarFill, { 
                    backgroundColor: item.color, 
                    width: progressAnims[i] ? progressAnims[i].interpolate({ 
                      inputRange: [0, 1], 
                      outputRange: ['0%', `${item.percent}%`] 
                    }) : `${item.percent}%`
                  }]} />
                </View>
                <Text style={styles.inlinePercent}>{item.percent}%</Text>
              </View>
            </View>
          </Animated.View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
            <ShoppingBag size={40} color="#222" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No transactions this month</Text>
        </View>
      )}
    </ScrollView>
  );
};

  const renderSplits = () => {
    const completionPercent = splitSummary.completionPercent || 0;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card: Amount to Recover */}
        <Animated.View style={[styles.baseCard, styles.splitHeroCard, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
          <Text style={styles.recoverLabelCenter}>AMOUNT TO RECOVER</Text>
          <Text style={styles.recoverValueLarge}>
  ₹{formatCurrency(splitSummary.toRecover)}
</Text>

          <Text style={styles.pendingGroupsText}>from {splitSummary.activeGroups} active {splitSummary.activeGroups === 1 ? 'group' : 'groups'} this month </Text>
        </Animated.View>

        {/* Received vs Share Row */}
        <View style={styles.subCardRow}>
          <Animated.View style={[styles.halfCard, { opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }] }]}>
            <View style={styles.cardIconRow}>
              <View style={[styles.iconBoxSmall, { backgroundColor: '#064e3b' }]}>
                <ArrowUpRight color={COLORS.income} size={12} />
              </View>
              <Text style={styles.cardLabel}>RECEIVED</Text>
            </View>
            <Text style={[styles.cardValueLarge1, { color: "#34D399" }]}>₹{formatCurrency(splitSummary.received)}</Text>
            <Text style={styles.dateSub1}>this month</Text>
          </Animated.View>

          <Animated.View style={[styles.halfCard, { opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }]}>
            <View style={styles.cardIconRow}>
              <View style={[styles.iconBoxSmall, { backgroundColor: '#450a0a' }]}>
                <ArrowDownLeft color={COLORS.expense} size={12} />
              </View>
              <Text style={styles.cardLabel}>YOUR SHARE</Text>
            </View>
            <Text style={[styles.cardValueLarge1, { color: '#fb7185' }]}>₹{formatCurrency(splitSummary.yourShare)}
</Text>
            <Text style={styles.dateSub1}>paid by you</Text>
          </Animated.View>
        </View>

        {/* Group Status Card */}
        <Animated.View style={[styles.baseCard, styles.statusCard, { opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }]}>
          <Text style={styles.chartTitle1}>GROUP STATUS</Text>
          
          <View style={styles.progressContainerMain}>
             <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Completion</Text>
                <Text style={styles.progressValueText}>{completionPercent}%</Text>
             </View>
             <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBarFill, { 
                  backgroundColor: COLORS.income, 
                  width: progressAnims[0].interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: ['0%', `${completionPercent}%`] 
                  }) 
                }]} />
             </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusBox1}>
              <Text style={styles.statusLabel1}>TOTAL</Text>
              <Text style={styles.statusNumber1}>
  {splitSummary.totalGroups}
</Text>

            </View>
           <View
  style={[
    styles.statusBox,
    { backgroundColor: '#091a14', borderColor: '#0d3326', borderWidth: 1 },
  ]}
>
  {/* ICON + LABEL ROW */}
  <View style={styles.statusRow}>
    <CircleCheckBig size={10} color={COLORS.income} strokeWidth={2.5} />
    <Text style={[styles.statusLabel, { color: COLORS.income }]}>
      DONE
    </Text>
  </View>

  <Text style={[styles.statusNumber, { color: COLORS.income }]}>
    {splitSummary.doneGroups}
  </Text>
</View>

<View
  style={[
    styles.statusBox,
    { backgroundColor: '#201708', borderColor: '#3e2a08', borderWidth: 1 },
  ]}
>
  {/* ICON + LABEL ROW */}
  <View style={styles.statusRow}>
    <Clock size={10} color={COLORS.gold} strokeWidth={2.5} />
    <Text style={[styles.statusLabel, { color: COLORS.gold }]}>
      ACTIVE
    </Text>
  </View>

 <Text style={[styles.statusNumber, { color: COLORS.gold }]}>
  {splitSummary.activeGroups}
</Text>

</View>

          </View>
        </Animated.View>

      <Animated.View
  style={{ opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }}
>
  <TouchableOpacity
    style={styles.manageButton}
    activeOpacity={0.8}
     onPress={() =>
    navigation.navigate('SplitTab', {
      screen: 'SplitMain',
    })
  }
  >
    <Text style={styles.manageButtonText}>MANAGE ALL SPLITS</Text>
    <ChevronRight color="black" size={18} />
  </TouchableOpacity>
</Animated.View>

      </ScrollView>
    );
  };

  return (
   <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}><Text style={styles.headerTitle}>Insights</Text></View>
        
        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.navBtn}  onPress={goToPrevMonth}><ChevronLeft color={COLORS.textSecondary} size={18} /></TouchableOpacity>
          <View style={styles.dateTextContainer}><Text style={styles.dateMain}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text><Text style={styles.dateSub}>
    {filterByMonth(transactions, currentDate).length} TRANSACTIONS
  </Text></View>
          <TouchableOpacity style={styles.navBtn}  onPress={goToNextMonth}><ChevronRight color={COLORS.textSecondary} size={18} /></TouchableOpacity>
        </View>
  
        {/* Tabs */}
        <View style={styles.tabBar}>
          {['OVERVIEW', 'EXPENSES', 'SPLITS'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}>
               <View style={styles.tabContent}>{activeTab === tab && <Check size={12} color="black" strokeWidth={4} style={{marginRight: 6}} />}<Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text></View>
            </TouchableOpacity>
          ))}
        </View>
  
       {activeTab === 'OVERVIEW' ? renderOverview() : 
     activeTab === 'EXPENSES' ? renderExpenses() : 
     renderSplits()}
      </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: { padding: 24, paddingBottom: 10 },
  headerTitle: { color: 'white', fontSize: 30, fontFamily:"Outfit-Black" },
  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.cardBg, marginHorizontal: 24, marginBottom: 16, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder },
  navBtn: { backgroundColor: COLORS.navBtn, padding: 8, borderRadius: 12 },
  dateTextContainer: { alignItems: 'center' },
  dateMain: { color: 'white', fontSize: 14, fontFamily:'Inter_18pt-Black'},
  dateSub: { color: COLORS.textSecondary, fontSize: 10,fontFamily:'Inter_18pt-ExtraBold',letterSpacing:0.5 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 20 },
  tabItem: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabItemActive: { backgroundColor: 'white' },
  tabContent: { flexDirection: 'row', alignItems: 'center' },
  tabText: { color: COLORS.textSecondary, fontFamily:'Inter_18pt-Black', fontSize: 10 },
  tabTextActive: { color: 'black', fontFamily:'Inter_18pt-Black' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  baseCard: { backgroundColor: COLORS.cardBg, borderRadius: 22, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16 },
  netFlowCard: { padding: 16 },
  netFlowHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    marginBottom: 16, 
    marginTop: 8     
  },
  emptyContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderStyle: 'dashed', // Optional: gives it a "placeholder" look
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: 'Outfit-Medium', // or your font
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subCardRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 4,
      
  },
  miniSubCard: { 
    flex: 1, 
    backgroundColor: '#101010', 
    borderRadius: 18, 
    padding: 15, 
    marginBottom: 4     
  },
  iconBox: { width: 44, height: 44, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  labelSmall: { color: COLORS.textSecondary, fontSize: 9, fontFamily:'Inter_18pt-Black', letterSpacing: 0.5 },
  valueLarge: { fontSize: 20, fontFamily:'Inter_18pt-Black' },
  cardContentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniIconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  valueMedium: { color: 'white', fontSize: 14, fontFamily:'Inter_18pt-Black' },
  halfCard: { flex: 1, backgroundColor: "#080808", borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 16, marginBottom: 16 },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBoxSmall: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { color: "#9DA3AF", fontSize: 10, fontFamily:'Inter_18pt-Black',letterSpacing:1 },
  cardValueLarge: { color: 'white', fontSize: 24, fontFamily:'Inter_18pt-Black' },
   cardValueLarge1: { color: 'white', fontSize: 20, fontFamily:'Inter_18pt-Black' },
  chartCard: { padding: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { color: 'white', fontSize: 13, fontFamily:'Inter_18pt-Black' },

  legend: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '800', marginLeft: 4 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120, // Give the chart area a fixed height
    marginTop: 20,
    paddingHorizontal: 10,
  },
  chartColumn: { alignItems: 'center' },
 barStack: {
    flexDirection: 'row', // Align IN and OUT bars side-by-side
    alignItems: 'flex-end',
    height: 100, // Matches your CHART_HEIGHT in dynamicWeeklyTrend
    gap: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    // Height is handled by Animation
  },
  weekText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', marginTop: 12 },
donutCard: { 
    padding: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  donutWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%',
    marginTop: 25, 
    justifyContent: 'space-between' 
  },
  svgContainer: { 
    position: 'relative', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  donutTextContainer: { 
    position: 'absolute', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  donutMainText: { 
    color: 'white', 
    fontSize: 18, 
    fontFamily: 'Inter_18pt-Black',
    lineHeight: 32
  },
  donutSubText: { 
    color: COLORS.textSecondary, 
    fontSize: 8, 
    fontFamily: 'Inter_18pt-Black',
    marginTop: -2
  },
  donutLegend: { 
    flex: 1, 
    marginLeft: 24, 
    gap: 8,
    justifyContent: 'center'
  },
  legendRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  legendDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 3, 
    marginRight: 8 
  },
  legendLabel: { 
    color: COLORS.textSecondary, 
    fontSize: 11, 
    fontFamily: 'Inter_18pt-Black', 
    flex: 1 
  },
  legendPercent: { 
    color: 'white', 
    fontSize: 11, 
    fontFamily: 'Inter_18pt-Black' 
  },
  totalSpentValue: { 
    color: '#FB7185',
    fontSize: 34, 
    fontFamily: 'Inter_18pt-Black', 
    textAlign: 'center', 
    marginTop: 4 
  },
  totalSpentLabel: { color: '#9DA3AF', fontSize: 10, fontFamily:'Inter_18pt-ExtraBold', textAlign: 'center' ,letterSpacing:1.5},
  sectionHeader: { color: '#9DA3AF', fontSize: 10, fontFamily: 'Outfit-Black', marginBottom: 16, letterSpacing: 1.5 },
  breakdownCard: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  categoryInfo: { flex: 1, marginLeft: 16 },
  categoryTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryTitle: { color: 'white', fontSize: 14, fontFamily:'Inter_18pt-Black' },
  categoryAmount: { color: 'white', fontSize: 14,  fontFamily:'Inter_18pt-Black'},
 progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, 
  },
  
  progressBarContainer: { 
    flex: 1, 
    height: 6, 
    backgroundColor: '#151515', 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    borderRadius: 3 
  },
  inlinePercent: { 
    color: "#9DA3AF", 
    fontSize: 10, 
    fontFamily: 'Inter_18pt-Black',
    minWidth: 35,
    textAlign: 'right'
  },
  categoryPercentBottom: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  recoverCard: {
    backgroundColor:"#0b0907",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recoverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recoverIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoverLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter_18pt-ExtraBold',
    letterSpacing: 1,
  },
  recoverValue: {
    color: '#fbbf24', 
    fontSize: 20,
    fontFamily: 'Inter_18pt-Black',
    marginTop: 2,
  },

  splitHeroCard: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"#090807",
    borderColor:"#191919"
  },
  recoverLabelCenter: {
    color: "#9DA3AF",
    fontSize: 10,
    fontFamily: 'Inter_18pt-Black',
    letterSpacing: 1.5,
  },
  recoverValueLarge: {
    color: '#fbbf24',
    fontSize: 36,
    fontFamily: 'Inter_18pt-Black',
    marginVertical: 8,
  },
  pendingGroupsText: {
    color: "#9DA3AF",
    fontSize: 12,
    fontFamily: 'Inter_18pt-Bold',
  },
  statusCard: {
    padding: 20,
  },
  progressContainerMain: {
    marginVertical: 20,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_18pt-Bold',
  },
  progressValueText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter_18pt-Black',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statusRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 4,
},
  statusLabel: {
    fontSize: 9,
    fontFamily: 'Inter_18pt-Black',
    color: "#9DA3AF",
      lineHeight: 12,
    letterSpacing: 1,
  },
  statusNumber: {
    fontSize: 18,
    fontFamily: 'Inter_18pt-Black',
    color: 'white',
    marginBottom:5
  },
statusBox1: {
  flex: 1,
  backgroundColor: '#111',
  borderRadius: 14,
  padding: 16,
  alignItems: 'center',   
  justifyContent: 'center'
},
    statusLabel1: {
    fontSize: 9,
    fontFamily: 'Inter_18pt-Black',
    color: "#9DA3AF",
   marginBottom:6,
    letterSpacing: 1,
   textAlign:'center'
  },
  statusNumber1: {
    fontSize: 18,
    fontFamily: 'Inter_18pt-Black',
    color: 'white',
    textAlign:'center',
  },
  manageButton: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  manageButtonText: {
    color: 'black',
    fontSize: 11,
    fontFamily: 'Inter_18pt-Black',
    letterSpacing: 1,
  },
    dateSub1: { color: COLORS.textSecondary, fontSize: 10,fontFamily:'Inter_18pt-ExtraBold',letterSpacing:0.5 ,marginTop:5},
       chartTitle1: { color: 'white', fontSize: 14, fontFamily:'Outfit-Black' },
});
