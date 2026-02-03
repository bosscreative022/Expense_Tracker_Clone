import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MoreVertical, 
  Trash2, 
  Check, 
  Clock, 
  Wallet, 
  X, 
  UserPlus, 
  Pencil,
  ArrowRight,
  CircleCheck
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 100;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function GroupOverviewScreen({ navigation, route }: any) {
  const { title, members, pending, collected, progress } = route.params;

  // --- UI TOGGLE STATE ---
  const [showMenu, setShowMenu] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
    // --- EDIT GROUP STATE (Pre-filled) ---
  const [editName, setEditName] = useState(title);
  const [editDesc, setEditDesc] = useState('');
  const [editTotal, setEditTotal] = useState('123');

  // --- ADD MEMBER STATE (Starts Empty) ---
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // --- LOGIC ---
  const isFullySettled = progress === 100;
  const amountPerPerson = (pending + collected) / (members + 1);
  
  // --- ANIMATION STATE ---
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    textOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress]);

  const animatedStrokeOffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });
 const isAddMemberDisabled = newName.trim() === '' || newAmount.trim() === '';
  const progressColor = progress === 100 ? '#0eac78' : '#ffffff';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.groupLabel}>GROUP</Text>
            <Text style={styles.groupTitle}>{title}</Text>
          </View>

          {/* DROPDOWN MENU */}
          <View style={{ zIndex: 50 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(!showMenu)}>
              <MoreVertical size={18} color="#fff" />
            </TouchableOpacity>

             {showMenu && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowEditGroup(true); setShowMenu(false); }}>
                  <Pencil size={14} color="#666" strokeWidth={2}/>
                  <Text style={styles.menuText}>Edit Group</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowAddMember(true); setShowMenu(false); }}>
                  <UserPlus size={14} color="#666" strokeWidth={2} />
                  <Text style={styles.menuText}>Add Member</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setShowMenu(false)}>
                  <Trash2 size={14} color="#f87170" strokeWidth={2}/>
                  <Text style={[styles.menuText, { color: '#f87170' }]}>Delete Group</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* PROGRESS CIRCLE */}
        <View style={styles.progressWrap}>
          <Svg width={SIZE} height={SIZE}>
            <Circle stroke="#1f1f1f" fill="none" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} />
            <AnimatedCircle
              stroke={progressColor}
              fill="none"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={animatedStrokeOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
          <View style={styles.progressText}>
            <Animated.Text style={[styles.percent, { opacity: textOpacity }]}>{progress}%</Animated.Text>
            <Text style={styles.complete}>COMPLETE</Text>
          </View>
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryTop}>
              <View style={[styles.iconBg, { backgroundColor: '#201708' }]}><Clock size={14} color="#96630b" /></View>
              <Text style={styles.summaryLabel}>PENDING</Text>
            </View>
            <Text style={styles.summaryAmount}>₹{pending.toLocaleString()}</Text>
          </View>
          <View style={styles.pipe} />
          <View style={styles.summaryItem}>
            <View style={styles.summaryTop}>
              <View style={[styles.iconBg, { backgroundColor: '#091a14' }]}><Wallet size={14} color="#0eac78" /></View>
              <Text style={styles.summaryLabel}>COLLECTED</Text>
            </View>
            <Text style={styles.summaryAmount}>₹{collected.toLocaleString()}</Text>
          </View>
        </View>
 {showEditGroup && (
          <View style={styles.inputCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Edit Group</Text>
              <TouchableOpacity onPress={() => setShowEditGroup(false)}><X size={18} color="#666" /></TouchableOpacity>
            </View>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Group Name" placeholderTextColor="#666" />
            <TextInput style={styles.input} value={editDesc} onChangeText={setEditDesc} placeholder="Description (optional)" placeholderTextColor="#666" />
            <TextInput style={styles.input} value={editTotal} onChangeText={setEditTotal} keyboardType="numeric" />
            <TouchableOpacity style={styles.submitBtn} onPress={() => setShowEditGroup(false)}>
              <Text style={styles.submitBtnText}>SAVE CHANGES</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 2: ADD MEMBER (Visible if showAddMember is true) */}
        {showAddMember && (
          <View style={styles.inputCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Add Member</Text>
              <TouchableOpacity onPress={() => setShowAddMember(false)}><X size={18} color="#666" /></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#666" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#666" keyboardType="numeric" value={newAmount} onChangeText={setNewAmount} />
            <TouchableOpacity 
              style={[styles.submitBtn, isAddMemberDisabled && styles.submitBtnDisabled]} 
              disabled={isAddMemberDisabled}
              onPress={() => setShowAddMember(false)}
            >
              <Text style={[styles.submitBtnText, isAddMemberDisabled && { color: 'black' }]}>ADD MEMBER</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PENDING SECTION */}
        {!isFullySettled && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>PENDING · 3</Text>
             <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddMember(true)}>
            <Text style={styles.addPlus}>+ Add</Text>
          </TouchableOpacity>
            </View>

            {[1, 2, 3].map((num) => (
              <View key={`pending-${num}`} style={styles.card}>
                <View style={styles.leftRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{num}</Text></View>
                  <View>
                    <Text style={styles.name}>Member {num}</Text>
                    <Text style={styles.amount}>₹{amountPerPerson.toFixed(0)}</Text>
                  </View>
                </View>
                <View style={styles.rightRow}>
                  <TouchableOpacity style={styles.smallBtn}><Trash2 size={14} color="#666" /></TouchableOpacity>
                  <View style={[styles.check, {backgroundColor: '#0eac78'}]}><Check size={18} color="black" strokeWidth={3} /></View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* SETTLED SECTION HEADER */}
        <View style={[styles.sectionRow, { justifyContent: 'flex-start', gap: 8, marginTop: 20 }]}>
          <CircleCheck size={14} color="#0eac78" />
          <Text style={styles.sectionLabel}>SETTLED · {isFullySettled ? members + 1 : 3}</Text>
        </View>

        {/* SETTLED CARDS (YOU, MEMBER 4, MEMBER 5) */}
        {['You', 'Member 4', 'Member 5'].map((person, idx) => (
          <View key={`settled-${idx}`} style={styles.settledCard}>
            <View style={styles.settledLeftRow}>
              <View style={styles.settledCheck}>
                <View style={[styles.check, {backgroundColor: '#0eac78', width: 32, height: 32, borderRadius: 10}]}>
                  <Check size={16} color="black" strokeWidth={4} />
                </View>
              </View>
              <View>
                <Text style={styles.name}>{person}</Text>
                <Text style={styles.settledAmount}>₹{amountPerPerson.toFixed(0)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settledCrossBtn}>
              <X size={14} color="#a0a7a5" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ))}

        {isFullySettled && (
  <View style={styles.allSettledWrap}>
    <View style={styles.allSettledIcon}>
      <Check size={26} color="black" strokeWidth={3} />
    </View>
    <Text style={styles.allSettledTitle}>All Settled!</Text>
    <Text style={styles.allSettledSub}>Everyone has paid</Text>
  </View>
)}

{!isFullySettled && (
  <View style={styles.summaryCard}>
    <View style={styles.summaryCardHeader}>
      <ArrowRight size={14} color="#666666" />
      <Text style={styles.summaryCardTitle}>SETTLEMENT SUMMARY</Text>
    </View>

    {[1, 2, 3].map((num, i) => (
      <View key={`sum-${i}`} style={styles.summaryItemRow}>
        <View style={styles.summaryMemberContainer}>
          <Text style={styles.summaryLetter}>{String.fromCharCode(97 + i)}</Text>
          <ArrowRight size={14} color="#2b2b2b" strokeWidth={2} />
          <Text style={styles.summaryYouText}>You</Text>
        </View>
        <Text style={styles.summaryValueText}>
          ₹{amountPerPerson.toFixed(0)}
        </Text>
      </View>
    ))}

    <View style={styles.summaryTotalRow}>
      <Text style={styles.totalCollectLabel}>TOTAL TO COLLECT</Text>
      <Text style={styles.totalCollectValue}>
        ₹{pending.toLocaleString()}
      </Text>
    </View>
  </View>
)}


        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 },
  headerCenter: { flex: 1, marginLeft: 15 },
  groupLabel: { color: '#777', fontSize: 10, fontFamily: 'Outfit-Bold' },
  groupTitle: { color: '#fff', fontSize: 20, fontFamily: 'Outfit-Black' },
  iconBtn: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center', borderColor: '#141414', borderWidth: 1 },
  
  // DROPDOWN STYLES
  dropdown: { 
    position: 'absolute', 
    top: 55, 
    right: 0, 
    backgroundColor: '#121212', 
    borderRadius: 15, 
    width: 160, 
    borderWidth: 1, 
    borderColor: '#222', 
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    gap: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1a1a1a' 
  },
  menuText: { color: '#eee', fontSize: 13, fontFamily: 'Inter_18pt-Bold' },

  progressWrap: { alignItems: 'center', marginVertical: 20 },
  progressText: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 0, bottom: 0, left: 0, right: 0 },
  percent: { color: '#fff', fontSize: 30, fontFamily: 'Outfit-Bold' },
  complete: { color: '#777', fontSize: 8, marginTop: 2, fontFamily: 'Inter-Black', fontWeight: '900', letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 25 },
  summaryItem: { alignItems: 'center' },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { color: '#666', fontSize: 9, fontFamily: 'Inter_18pt-ExtraBold' },
  summaryAmount: { color: '#fff', fontSize: 18, fontFamily: 'Inter_18pt-Black', marginTop: 6 },
  pipe: { width: 1, height: 40, backgroundColor: '#FFFFFF1A' },
  
  settledCard: { 
    backgroundColor: '#02130d', 
    borderRadius: 18, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#04251a' 
  },
  settledLeftRow: { flexDirection: 'row', alignItems: 'center' },
  settledCheck: { marginRight: 15 },
  settledAmount: { color: '#777', fontFamily: 'Inter_18pt-Black', fontSize: 13 },
  settledCrossBtn: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#1c2b26', justifyContent: 'center', alignItems: 'center' },
  
  summaryCard: { 
    backgroundColor: '#050505', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#111', 
    marginTop: 5,
    marginBottom: 25
  },
  summaryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  summaryCardTitle: { color: '#777', fontSize: 11, fontFamily: 'Inter_18pt-Black' },
  summaryItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  summaryMemberContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 }, 
  summaryLetter: { color: '#fff', fontSize: 15, fontFamily: 'Inter_18pt-Bold' },
  summaryYouText: { color: '#9b9b99', fontFamily: 'Outfit-Bold', fontSize: 14  },
  summaryValueText: { color: '#fbbf24', fontFamily: 'Outfit-Black', fontSize: 16 },
  summaryTotalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, 
    paddingTop: 13, 
    borderTopWidth: 1, 
    borderTopColor: '#121212' 
  },
  totalCollectLabel: { color: '#555', fontSize: 12, fontFamily: 'Inter_18pt-Black' },
  totalCollectValue: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Black' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  sectionLabel: { color: '#666', fontSize: 10, fontFamily: 'Inter_18pt-Black' },
  addPlus: { color: '#666', fontSize: 10, fontFamily: 'Inter_18pt-Bold' },
  card: { backgroundColor: '#080808', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderColor: '#121212', borderWidth: 1 },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontFamily: 'Outfit-Bold' },
  name: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 14 },
  amount: { color: '#777', fontFamily: 'Inter_18pt-Black' },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallBtn: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  check: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1dbf73', justifyContent: 'center', alignItems: 'center' },
  iconBg: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
   inputCard: { backgroundColor: '#080808', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1a1a1a', marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: '#fff', fontFamily: 'Inter_18pt-Black', fontSize: 14 },
  input: { backgroundColor: '#111', borderRadius: 12, padding: 15, color: '#fff', marginBottom: 12, fontFamily: 'Inter_18pt-Bold', fontSize: 14, borderWidth: 1, borderColor: '#1a1a1a' },
  submitBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  submitBtnDisabled: { backgroundColor: '#535353' },
  submitBtnText: { color: 'black', fontFamily: 'Inter_18pt-Black', fontSize: 14 },

allSettledWrap: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 30,
  marginBottom: 40,
},

allSettledIcon: {
  width: 56,
  height: 56,
  borderRadius: 18,
  backgroundColor: '#0eac78',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
},

allSettledTitle: {
  color: '#fff',
  fontSize: 18,
  fontFamily: 'Outfit-Black',
},

allSettledSub: {
  color: '#777',
  fontSize: 12,
  marginTop: 4,
  fontFamily: 'Inter_18pt-Bold',
},

});