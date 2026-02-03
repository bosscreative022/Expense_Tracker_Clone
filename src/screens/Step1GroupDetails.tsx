import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated, // Added Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Users,
  FileText,
  Wallet,
  ChevronRight,
  UserPlus,
  Trash2,
} from 'lucide-react-native';
import SplitProgressBar from '../screens/SplitProgressBar';

export default function Step1GroupDetails({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [tab, setTab] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [members, setMembers] = useState([
    { id: 1, name: 'You', paid: true },
    { id: 2, name: '', paid: false },
  ]);
  const [customAmounts, setCustomAmounts] = useState<Record<number, string>>({});
const [direction, setDirection] = useState<'NEXT' | 'BACK'>('NEXT');
  // --- ANIMATION SETUP ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
const translateXAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600, // Slow and smooth
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // --- HELPERS ---
  const totalAmount = Number(amount || 0);
  const isValidStep1 = name.trim().length > 0 && amount.trim().length > 0;
  const eachPays = members.length ? (totalAmount / members.length).toFixed(2) : '0.00';

 const handleBack = () => {
  setDirection('BACK');
  if (currentStep > 1) setCurrentStep(prev => prev - 1);
  else navigation.goBack();
};

  const addMember = () => setMembers(prev => [...prev, { id: Date.now(), name: '', paid: false }]);
  
  const removeMember = (id: number) => {
    if (members.length <= 2) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMemberName = (id: number, value: string) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, name: value } : m)));
  };

  const renderHeader = () => {
    const stepTitles = ["", "Group Details", "Add Members", "Review"];
    return (
      <>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.stepCount}>STEP {currentStep} OF 3</Text>
            <Text style={styles.mainTitle}>{stepTitles[currentStep]}</Text>
          </View>
        </View>
        <SplitProgressBar step={currentStep} />
      </>
    );
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
    flex: 1,
  };

  return (
    <SafeAreaView style={styles.screen}>
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* STEP 1 */}
        {currentStep === 1 && (
          <Animated.View style={animatedStyle}>
            <View style={styles.card}>
              <View style={styles.iconTop}><Users size={13} color="#777" /></View>
              <View style={styles.textBox}>
                <Text style={styles.label}>GROUP NAME</Text>
                <TextInput style={styles.input} placeholder="Trip to Goa..." placeholderTextColor="#393939" value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.iconBox}><FileText size={13} color="#777" /></View>
              <View style={styles.textBox}>
                <Text style={styles.label}>DESCRIPTION <Text style={styles.optionalText}>(OPTIONAL)</Text></Text>
                <TextInput style={styles.input2} placeholder="Add notes..." placeholderTextColor="#393939" value={desc} onChangeText={setDesc} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.iconBox}><Wallet size={16} color="#777" /></View>
              <View style={styles.textBox}>
                <Text style={styles.label}>TOTAL AMOUNT</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.rupeeLarge}>₹</Text>
                  <TextInput style={styles.amountMain} placeholder="0" placeholderTextColor="#393939" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, isValidStep1 && styles.btnActive]}
              disabled={!isValidStep1}
              onPress={() => setCurrentStep(2)}
            >
              <View style={styles.btnContent}>
                <Text style={[styles.btnText, isValidStep1 && styles.btnTextActive]} onPress={() => {
  setDirection('NEXT');
  setCurrentStep(2);
}}>CONTINUE</Text>
                <ChevronRight color="#000" size={20} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <Animated.View style={animatedStyle}>
            <View style={styles.tabs}>
              {['EQUAL', 'CUSTOM'].map(t => (
                <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t as any)}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'EQUAL' ? 'EQUAL SPLIT' : 'CUSTOM AMOUNT'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {members.map((member, index) => (
              <View key={member.id} style={tab === 'CUSTOM' ? styles.memberCardCustom : styles.memberCardEqual}>
                <View style={styles.memberRowTop}>
                  <View style={[styles.avatar, { backgroundColor: member.paid || member.name ? '#fff' : '#111' }]}>
                    <Text style={[styles.avatarText, { color: member.paid || member.name ? '#000' : '#666' }]}>
                      {member.paid ? 'Y' : (member.name ? member.name.charAt(0).toUpperCase() : index + 1)}
                    </Text>
                  </View>
                  {member.paid ? <Text style={styles.memberNameYou}>You</Text> : 
                    <TextInput value={member.name} onChangeText={text => updateMemberName(member.id, text)} style={styles.memberNameInput} placeholder={`Member ${index + 1}`} placeholderTextColor="#777" />
                  }
                  {member.paid && <View style={styles.paidTag}><Text style={styles.paidText}>PAID</Text></View>}
                  {!member.paid && members.length > 2 && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => removeMember(member.id)}><Trash2 size={13} color="#666" /></TouchableOpacity>
                  )}
                </View>
                {tab === 'CUSTOM' && (
                  <View style={styles.customAmountRow}>
                    <Text style={styles.rupeeSmall}>₹</Text>
                    <View style={styles.amountBoxCustom}>
                      <TextInput style={styles.amountInputSmall} keyboardType="numeric" placeholder="0" placeholderTextColor="#444" value={customAmounts[member.id] || ''} onChangeText={val => setCustomAmounts(prev => ({ ...prev, [member.id]: val }))} />
                    </View>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addMemberDashed} onPress={addMember}>
              <UserPlus size={17} color="#555" /><Text style={styles.addMemberText}>Add Member</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnActiveFixed} onPress={() => setCurrentStep(3)}>
              <View style={styles.btnContent}><Text style={styles.btnTextActive} onPress={() => {
  setDirection('NEXT');
  setCurrentStep(3);
}}>CONTINUE</Text><ChevronRight size={16} color="#000" /></View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <Animated.View style={animatedStyle}>
            <View style={styles.infoCard}>
              <Text style={styles.labelInter}>GROUP NAME</Text>
              <Text style={styles.groupNameFinal}>{name}</Text>
              <View style={styles.divider} />
              <Text style={styles.labelInter}>TOTAL AMOUNT</Text>
              <Text style={styles.totalAmountFinal}>₹{totalAmount}</Text>
            </View>
            <Text style={styles.membersLabelInter}>{members.length} MEMBERS</Text>
            {members.map((member, index) => {
              const val = tab === 'EQUAL' ? totalAmount / members.length : Number(customAmounts[member.id] || 0);
              return (
                <View key={member.id} style={styles.reviewCard}>
                  <View style={styles.leftRowReview}>
                    <View style={styles.avatarWhite}><Text style={styles.avatarBlackText}>{member.paid ? 'Y' : index + 1}</Text></View>
                    <Text style={styles.memberNameReview}>{member.paid ? 'You' : member.name || `Member ${index + 1}`}</Text>
                    {member.paid && <View style={styles.paidTag}><Text style={styles.paidText}>PAID</Text></View>}
                  </View>
                  <Text style={styles.memberAmountReview}>₹{val.toFixed(2)}</Text>
                </View>
              );
            })}
            <TouchableOpacity style={styles.btnActiveFixed} onPress={() => navigation.popToTop()}>
              <Text style={styles.btnTextActive}>✓ CREATE GROUP</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 15 },
  stepContainer: { flex: 1 },

  // --- STATIC HEADER ---
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 45, height: 45, borderRadius: 12, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#151515',
  },
  stepCount: { color: '#777', fontFamily: 'Outfit-Bold', letterSpacing: 1.5, fontSize: 9, marginTop: 10 },
  mainTitle: { color: '#fff', fontSize: 18, marginBottom: 15, fontFamily: 'Outfit-Black', lineHeight: 24 },

  // --- STEP 1 SPECIFIC ---
  card: {
    flexDirection: 'row', backgroundColor: '#080808', borderRadius: 18, padding: 13,
    marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: '#151515',
  },
  iconBox: {
    width: 30, height: 30, borderRadius: 12, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, alignSelf: 'flex-start', marginTop: 2,
  },
  iconTop: {
    width: 30, height: 30, borderRadius: 12, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, alignSelf: 'flex-start', marginTop: 2,
  },
  textBox: { flex: 1 },
  label: { color: '#6c6c6c', fontSize: 10, marginBottom: 3, marginTop: 12, fontFamily: 'Outfit-Bold' },
  optionalText: { fontFamily: 'Outfit-Bold', color: '#393939', marginLeft: 4 },
  input: {
    color: '#fff', fontSize: 17, textAlign: 'left', paddingLeft: 0,
    position: 'relative', left: -40, fontFamily: "Inter-Black", fontWeight: '900', marginTop: 5
  },
  input2: {
    color: '#fff', fontSize: 16, textAlign: 'left', paddingLeft: 0,
    position: 'relative', left: -40, fontFamily: "Inter-Black", fontWeight: '900', marginTop: 5
  },
  amountInputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  amountMain: {
    color: '#fff', fontSize: 30, position: 'relative', left: -47, bottom: -13, width: '120%', fontFamily: 'Inter_18pt-Black'
  },
  rupeeLarge: {
    color: '#535353', fontSize: 25, marginRight: 6, position: 'relative', left: -44, fontFamily: 'Outfit-ExtraBold',
  },

  // --- STEP 2 SPECIFIC ---
  tabs: {
    flexDirection: 'row', backgroundColor: '#080808', borderRadius: 18, padding: 4,
    marginTop: 20, gap: 4, borderWidth: 1, borderColor: '#151515', marginBottom: 10,
  },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', borderRadius: 14 },
  tabText: { color: '#666', fontSize: 11, fontFamily: 'Inter_18pt-Black' },
  tabTextActive: { color: '#000', fontFamily: 'Inter_18pt-Black' },
  memberCardEqual: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#080808',
    borderRadius: 18, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#151515',
  },
  memberCardCustom: {
    backgroundColor: '#0b0b0b', borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#151515',
  },
  memberRowTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontFamily: 'Inter_18pt-Black', fontSize: 15 },
  memberNameYou: { color: '#fff', fontSize: 14, fontFamily: 'Outfit-SemiBold' },
  memberNameInput: { flex: 1, color: '#fff', fontSize: 15, fontFamily: 'Inter-Black', fontWeight: "800" },
  paidTag: {
    marginLeft: 7, backgroundColor: 'rgb(9 43 32)', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  paidText: { color: 'rgb(52 211 153)', fontSize: 10, fontFamily: 'Outfit-Bold' },
  deleteBtn: {
    marginLeft: 'auto', width: 30, height: 30, borderRadius: 10, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
  },
  customAmountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  amountBoxCustom: {
    flex: 1, backgroundColor: '#151515', borderRadius: 14, paddingVertical: 12,
    paddingHorizontal: 14, borderColor: '#1c1c1c', borderWidth: 1,
  },
  rupeeSmall: { color: '#fff', fontSize: 16, marginRight: 10, fontFamily: 'Outfit-Bold' },
  amountInputSmall: { color: '#fff', fontSize: 14, fontFamily: 'Inter_18pt-Bold', padding: 0 },
  addMemberDashed: {
    marginTop: 14, borderWidth: 0.5, borderRadius: 18, padding: 18, alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row', gap: 6, borderColor: '#151515', borderStyle: 'dashed',
  },
  addMemberText: { color: '#505050', fontSize: 15, fontFamily: 'Inter_18pt-Bold' },
  summaryCard: {
    backgroundColor: '#080808', borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#151515',
  },
  summaryLabel: { color: 'white', fontSize: 14, fontFamily: 'Outfit-SemiBold', marginRight: 5 },
  amountRowSummary: { flexDirection: 'row', alignItems: 'flex-end' },
  rupeeSymbolSummary: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Black', marginRight: 4, lineHeight: 22 },
  amountTextSummary: { color: '#fff', fontSize: 18, fontFamily: 'Inter_18pt-Black', letterSpacing: 0.4 },

  // --- STEP 3 SPECIFIC ---
  infoCard: { backgroundColor: '#0b0b0b', borderRadius: 18, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#151515' },
  labelInter: { color: '#666', fontSize: 10, marginBottom: 6, fontFamily: 'Inter_18pt-Black' },
  groupNameFinal: { color: '#fff', fontSize: 20, marginBottom: 10, fontFamily: 'Outfit-Black' },
  divider: { height: 1, backgroundColor: '#1a1a1a', marginVertical: 10 },
  totalAmountFinal: { color: '#fff', fontSize: 30, fontFamily: 'Inter_18pt-Black' },
  membersLabelInter: { color: '#666', fontSize: 10, marginTop: 16, marginBottom: 8, fontFamily: 'Inter_18pt-Black' },
  reviewCard: {
    backgroundColor: '#0b0b0b', borderRadius: 18, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: '#151515',
  },
  leftRowReview: { flexDirection: 'row', alignItems: 'center' },
  avatarWhite: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarBlackText: { color: '#000', fontFamily: 'Outfit-Bold' },
  memberNameReview: { color: '#fff', fontSize: 14, marginRight: 8, fontFamily: 'Inter-Black', fontWeight: "800" },
  memberAmountReview: { color: 'white', fontSize: 13, fontFamily: 'Inter_18pt-Black' },

  // --- GLOBAL BUTTONS ---
  btn: { marginTop: 'auto', backgroundColor: '#333', padding: 17, alignItems: 'center', borderRadius: 22 },
  btnActive: { backgroundColor: '#fff', borderRadius: 22 },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#000', fontSize: 18, fontFamily: 'Outfit-Black' },
  btnTextActive: { color: '#000', fontSize: 18, fontFamily: 'Outfit-Black' },
  btnActiveFixed: { marginTop: 'auto', backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: 10 },
});