import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Animated, StatusBar, Easing, Dimensions
} from 'react-native';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Target, 
  ArrowUp, ArrowDown, Check, ShoppingBag, 
  Home, CreditCard, ShoppingCart, HelpCircle, 
  ShoppingBasket,
  Utensils,
  Tv,
  Coffee,
  Briefcase,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CircleCheckBig
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const horizontalPadding = SCREEN_WIDTH * 0.06;
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
const GAP = 6;
const DONUT_DATA = [
  { label: 'Shopping', percent: 62, color: COLORS.cyan },
  { label: 'Rent', percent: 20, color: COLORS.purpleChart },
  { label: 'Split', percent: 12, color: COLORS.gold },
  { label: 'Grocery', percent: 8, color: COLORS.emerald },
];
const CATEGORY_DATA = [
  {
    label: 'Shopping',
    amount: '93,700',
    percent: 62,
    color: '#ec4899',
    icon: ShoppingBag,
  },
  {
    label: 'Rent',
    amount: '23,000',
    percent: 20,
    color: "#4f46e5",
    icon: Home,
  },
  {
    label: 'Split',
    amount: '12,568',
    percent: 12,
    color: COLORS.gold,
    icon: CreditCard,
  },
  {
    label: 'Grocery',
    amount: '2,000',
    percent: 8,
    color: "#14b8a6",
    icon: ShoppingBasket,
  },
   {
    label: 'Groceries',
    amount: '2,000',
    percent: 2,
    color: "#64748b",
    icon: HelpCircle,
  },
   {
    label: 'Food',
    amount: '2,000',
    percent: 18,
    color: "#f97316",
    icon: Utensils,
  },
   {
    label: 'Entertain',
    amount: '2,000',
    percent: 67,
    color: "#f43f5e",
    icon: Tv,
  },
   {
    label: 'Coffee',
    amount: '2,000',
    percent: 89,
    color: "#d97706",
    icon: Coffee,
  },
   {
    label: 'Education',
    amount: '2,000',
    percent: 58,
    color: "#2563eb",
    icon: Briefcase,
  },
   
];


const WEEKLY_TREND = [
  { label: 'W1', in: 40, out: 20 },
  { label: 'W2', in: 95, out: 45 },
  { label: 'W3', in: 25, out: 75 },
  { label: 'W4', in: 15, out: 12 },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));

  // --- Animation Refs ---
  const fadeAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([...Array(10)].map(() => new Animated.Value(30))).current;
  const barAnims = useRef(WEEKLY_TREND.map(() => ({ in: new Animated.Value(0), out: new Animated.Value(0) }))).current;
  
  // Individual segment animations for sequential filling
 const segmentAnims = useRef(DONUT_DATA.map(() => new Animated.Value(0))).current;
const progressAnims = useRef(CATEGORY_DATA.map(() => new Animated.Value(0))).current;


  const runAnimations = useCallback(() => {
    // Reset values
    fadeAnims.forEach(anim => anim.setValue(0));
    slideAnims.forEach(anim => anim.setValue(30));
    barAnims.forEach(bar => { bar.in.setValue(0); bar.out.setValue(0); });
    segmentAnims.forEach(anim => anim.setValue(0));
    progressAnims.forEach(anim => anim.setValue(0));

    // 1. Entry Fade & Slide
    const popIn = fadeAnims.map((anim, i) => 
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slideAnims[i], { toValue: 0, duration: 450, useNativeDriver: true })
      ])
    );

    // 2. Specific View Animations
    let detailAnims = [];
    if (activeTab === 'OVERVIEW') {
      detailAnims = [
        ...barAnims.map((bar, i) => Animated.timing(bar.in, { toValue: WEEKLY_TREND[i].in, duration: 800, useNativeDriver: false })),
        ...barAnims.map((bar, i) => Animated.timing(bar.out, { toValue: WEEKLY_TREND[i].out, duration: 800, useNativeDriver: false }))
      ];
    } else if (activeTab === 'EXPENSES' || activeTab === 'SPLITS') { 
  detailAnims = [
    // If it's Expenses, run the donut segments
    ...(activeTab === 'EXPENSES' ? [
      Animated.stagger(150, segmentAnims.map(anim => 
        Animated.timing(anim, { 
          toValue: 1, 
          duration: 400,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false 
        })
      ))
    ] : []),
    // Run progress bars for both Expenses and Splits
    Animated.stagger(100, progressAnims.map(anim => 
      Animated.timing(anim, { 
        toValue: 1, 
        duration: 800, // Slightly slower for a more premium feel
        easing: Easing.out(Easing.exp), 
        useNativeDriver: false 
      })
    ))
  ];
}
    Animated.sequence([
      Animated.stagger(60, popIn),
      Animated.parallel(detailAnims)
    ]).start();
  }, [activeTab]);

  useFocusEffect(runAnimations);

  // --- Sub-Renders ---

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Net Flow Card */}
      <Animated.View style={[styles.baseCard, styles.netFlowCard, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
        <View style={styles.netFlowHeader}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.income }]}><TrendingUp color="white" size={20} /></View>
          <View>
            <Text style={styles.labelSmall}>NET FLOW</Text>
            <Text style={[styles.valueLarge, { color: COLORS.income }]}>+₹143.33</Text>
          </View>
        </View>
        <View style={styles.subCardRow}>
          <View style={styles.miniSubCard}><View style={styles.cardContentRow}><View style={[styles.miniIconBox, { backgroundColor: COLORS.income }]}><ArrowUp color="white" size={14} /></View><View><Text style={styles.labelSmall}>IN</Text><Text style={styles.valueMedium}>₹150,161.33</Text></View></View></View>
          <View style={styles.miniSubCard}><View style={styles.cardContentRow}><View style={[styles.miniIconBox, { backgroundColor: COLORS.expense }]}><ArrowDown color="white" size={14} /></View><View><Text style={styles.labelSmall}>OUT</Text><Text style={styles.valueMedium}>₹150,018</Text></View></View></View>
        </View>
      </Animated.View>

      <View style={styles.subCardRow}>
        <Animated.View style={[styles.halfCard, { opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }] }]}>
          <View style={styles.cardIconRow}><View style={[styles.iconBoxSmall, { backgroundColor: '#072a30' }]}><TrendingUp color={COLORS.cyan} size={12} /></View><Text style={styles.cardLabel}>SAVINGS</Text></View>
          <Text style={[styles.cardValueLarge, { color: COLORS.gold }]}>0%</Text>
        </Animated.View>
        <Animated.View style={[styles.halfCard, { opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }]}>
          <View style={styles.cardIconRow}><View style={[styles.iconBoxSmall, { backgroundColor: '#281737' }]}><Target color={COLORS.purpleChart} size={12} /></View><Text style={styles.cardLabel}>DAILY AVG</Text></View>
          <Text style={styles.cardValueLarge}>₹5,001</Text>
        </Animated.View>
      </View>

      {/* Weekly Trend Chart */}
      <Animated.View style={[styles.baseCard, styles.chartCard, { opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }]}>
        <View style={styles.chartHeader}><Text style={styles.chartTitle}>WEEKLY TREND</Text><View style={styles.legend}><View style={[styles.dot, { backgroundColor: COLORS.income }]} /><Text style={styles.legendText}>IN</Text><View style={[styles.dot, { backgroundColor: COLORS.expense, marginLeft: 8 }]} /><Text style={styles.legendText}>OUT</Text></View></View>
        <View style={styles.chartContainer}>{WEEKLY_TREND.map((item, i) => (
          <View key={i} style={styles.chartColumn}><View style={styles.barStack}><Animated.View style={[styles.bar, { backgroundColor: COLORS.income, height: barAnims[i].in }]} /><Animated.View style={[styles.bar, { backgroundColor: COLORS.expense, height: barAnims[i].out }]} /></View><Text style={styles.weekText}>{item.label}</Text></View>
        ))}</View>
      </Animated.View>

   <Animated.View style={{ opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }}>
      <TouchableOpacity 
        style={styles.recoverCard} 
        activeOpacity={0.7}
     onPress={() => setActiveTab('SPLITS')}
      >
        <View style={styles.recoverLeft}>
          <View style={styles.recoverIconBox}>
            <Users color="#fbbf24" size={20} />
          </View>
          <View>
            <Text style={styles.recoverLabel}>TO RECOVER</Text>
            <Text style={styles.recoverValue}>₹56,529.5</Text>
          </View>
        </View>
        <ChevronRight color="#93A3AF" size={18} strokeWidth={2}/>
      </TouchableOpacity>
    </Animated.View>
  </ScrollView>
);
const renderExpenses = () => {
  const size = 120;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const gapDegrees = 4;
  const totalGapDegrees = gapDegrees * DONUT_DATA.length;
  const availableDegrees = 360 - totalGapDegrees;
  
  // Starting point: -90 degrees is the top center (12 o'clock)
  let currentRotation = -90;


    return (
     <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.baseCard, styles.donutCard, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
        <Text style={styles.totalSpentLabel}>TOTAL SPENT</Text>
        <Text style={styles.totalSpentValue}>₹150,018</Text>
        
       <View style={styles.donutWrapper}>
          <View style={[styles.svgContainer, { width: size, height: size }]}>
            <Svg width={size} height={size}>
              {/* No global rotation on G here, we handle it per segment */}
              <G origin={`${center}, ${center}`}>
                {/* Background Track */}
                <Circle 
                  cx={center} cy={center} r={radius} 
                  stroke="#111" strokeWidth={strokeWidth} fill="transparent" 
                />
                
                {DONUT_DATA.map((item, i) => {
                  const segmentDegrees = (item.percent / 100) * availableDegrees;
                  const strokeLength = (segmentDegrees / 360) * circumference;
                  const strokeOffset = circumference - strokeLength;
                  
                  // ANTI-CLOCKWISE LOGIC: 
                  // We rotate the segment container to the START of where it should be.
                  // Since SVG draws clockwise, we move the starting point backward.
                  const segmentStartAngle = currentRotation - segmentDegrees;
                  
                  const segment = (
                    <G 
                      key={i} 
                      rotation={segmentStartAngle} 
                      origin={`${center}, ${center}`}
                    >
                      <AnimatedCircle
                        cx={center} cy={center} r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={segmentAnims[i].interpolate({ 
                          inputRange: [0, 1], 
                          outputRange: [circumference, strokeOffset],
                        })}
                        strokeLinecap="round"
                      />
                    </G>
                  );
                  
                  // Move the marker backward for the next segment + gap
                  currentRotation -= (segmentDegrees + gapDegrees);
                  
                  return segment;
                })}
              </G>
            </Svg>
            <View style={styles.donutTextContainer}>
              <Text style={styles.donutMainText}>11</Text>
              <Text style={styles.donutSubText}>CATEGORIES</Text>
            </View>
          </View>

          <View style={styles.donutLegend}>
            {DONUT_DATA.slice(0, 5).map((item, i) => (
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

   {CATEGORY_DATA.map((item, i) => (
  <Animated.View 
    key={i} 
    style={[
      styles.baseCard, 
      styles.breakdownCard, 
      { opacity: fadeAnims[i+1], transform: [{ translateY: slideAnims[i+1] }] }
    ]}
  >
    {/* Background color from data, Icon color forced to white */}
    <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
      <item.icon color="#ffffff" size={20} strokeWidth={2.5} />
    </View>

    <View style={styles.categoryInfo}>
      <View style={styles.categoryTopRow}>
        <Text style={styles.categoryTitle}>{item.label}</Text>
        <Text style={styles.categoryAmount}>₹{item.amount}</Text>
      </View>
      
      <View style={styles.progressRow}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { 
            backgroundColor: item.color, 
            width: progressAnims[i].interpolate({ 
              inputRange: [0, 1], 
              outputRange: ['0%', `${item.percent}%`] 
            }) 
          }]} />
        </View>
        <Text style={styles.inlinePercent}>{item.percent}%</Text>
      </View>
    </View>
  </Animated.View>
))}
    </ScrollView>
  );
};

  // --- Render Splits Tab (Matches Image) ---
  const renderSplits = () => {
    const completionPercent = 16; // Based on image

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card: Amount to Recover */}
        <Animated.View style={[styles.baseCard, styles.splitHeroCard, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
          <Text style={styles.recoverLabelCenter}>AMOUNT TO RECOVER</Text>
          <Text style={styles.recoverValueLarge}>₹56,529.5</Text>
          <Text style={styles.pendingGroupsText}>from 21 pending groups</Text>
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
            <Text style={[styles.cardValueLarge1, { color: "#34D399" }]}>₹16,808.33</Text>
            <Text style={styles.dateSub1}>this month</Text>
          </Animated.View>

          <Animated.View style={[styles.halfCard, { opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }]}>
            <View style={styles.cardIconRow}>
              <View style={[styles.iconBoxSmall, { backgroundColor: '#450a0a' }]}>
                <ArrowDownLeft color={COLORS.expense} size={12} />
              </View>
              <Text style={styles.cardLabel}>YOUR SHARE</Text>
            </View>
            <Text style={[styles.cardValueLarge1, { color: '#fb7185' }]}>₹12,568</Text>
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
              <Text style={styles.statusNumber1}>25</Text>
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
    4
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
    21
  </Text>
</View>

          </View>
        </Animated.View>

        {/* Manage Button */}
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
        <TouchableOpacity style={styles.navBtn}><ChevronLeft color={COLORS.textSecondary} size={18} /></TouchableOpacity>
        <View style={styles.dateTextContainer}><Text style={styles.dateMain}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text><Text style={styles.dateSub}>57 TRANSACTIONS</Text></View>
        <TouchableOpacity style={styles.navBtn}><ChevronRight color={COLORS.textSecondary} size={18} /></TouchableOpacity>
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
  headerTitle: { color: 'white', fontSize: 30, fontWeight: '900' },
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
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  chartColumn: { alignItems: 'center' },
  barStack: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  bar: { width: 14, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
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