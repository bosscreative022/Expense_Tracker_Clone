import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  IndianRupee,
  Briefcase,
  Coins,
  Home,
  TrendingUp,
  Plus,
  CreditCard,
  Gift,
  Banknote,
  Wallet,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomCalendar from './CustomCalendar';
const { height: screenHeight } = Dimensions.get('window');
const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';

const categories = [
  { name: 'Salary', icon: Briefcase, color: '#10b981' },
  { name: 'Business', icon: TrendingUp, color: '#3b82f6' },
  { name: 'Investment', icon: Coins, color: '#f59e0b' },
  { name: 'Freelance', icon: CreditCard, color: '#a855f7' },
  { name: 'Rent', icon: Home, color: '#6366f1' },
  { name: 'Gift', icon: Gift, color: '#f43f5e' },
  { name: 'Bonus', icon: Sparkles, color: '#f97316' },
  { name: 'Refund', icon: Banknote, color: '#14b8a6' },
  { name: 'Stock Market', icon: TrendingUp, color: '#06b6d4' },
  { name: 'Interest', icon: Coins, color: '#059669' },
  { name: 'Freelancing', icon: Plus, color: '#2563eb' },
  { name: 'Commission', icon: Wallet, color: '#8b5cf6' },
  { name: 'Grants', icon: Sparkles, color: '#4f46e5' },
  { name: 'Other', icon: Plus, color: '#64748b' },
];

export default function AddIncome({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const confirmAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const [layouts, setLayouts] = useState<Record<string, { x: number; y: number }>>({});
const lockRef = useRef(false);

  useEffect(() => {
    if (step === 2 && layouts[category]) {
      Animated.parallel([
        Animated.timing(dotOpacity, { toValue: 1, duration: 1, useNativeDriver: true }),
        Animated.spring(dotAnim, {
          toValue: { x: layouts[category].x, y: layouts[category].y },
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [category, layouts, step]);

  const handleTabLayout = (name: string, event: any) => {
    const { x, y, width: w, height: h } = event.nativeEvent.layout;
    setLayouts((prev) => ({
      ...prev,
      [name]: { x: x + w - 24, y: y + h / 2 - 3 },
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => (step === 1 ? navigation.goBack() : setStep((prev) => prev - 1));

const handleConfirm = async () => {
  if (lockRef.current) return;
  lockRef.current = true;
  setIsReporting(true);

  Animated.sequence([
    Animated.timing(confirmAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
    Animated.timing(confirmAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
  ]).start();
const parsedAmount = parseFloat(amount);

if (!parsedAmount || isNaN(parsedAmount)) {
  alert('Enter a valid amount');
  setIsReporting(false);
  return;
}

  try {
    const payload = {
      amount: parsedAmount,
      type: 'Income',
      date: date.toISOString(),
      description: description || '',
      incomeCategoryName: category,
    };

    console.log('📤 Sending income payload:', payload);

    const res = await API.post('/user/add-income', payload);

    console.log('✅ Income added:', res.data);

    // Optional success feedback
    // Toast / Snackbar / Haptic here

    navigation.goBack(); // Go back ONLY on success
  } catch (error: any) {
    console.error(
      '❌ Add income failed:',
      error.response?.data || error.message
    );
    alert('Failed to add income. Please try again.');
  } finally {
    lockRef.current = false;
  setIsReporting(false);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />

        <View style={styles.header}>
          <Pressable onPress={prevStep} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={20} strokeWidth={1} />
          </Pressable>
          <Text style={styles.headerTitle}>RECORD INCOME</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.steps}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.stepDot, step === i && styles.stepDotActive]} />
          ))}
        </View>

        <View style={styles.content}>
          {step === 1 && (
            <View style={styles.stepOneWrapper}>
              <View style={styles.stepOneCenter}>
                <Text style={styles.label}>ENTER AMOUNT</Text>
                <View style={styles.amountWrapper}>
                  <IndianRupee size={36} color="#064a34" strokeWidth={2} style={styles.currencyIcon} />
                  <TextInput
                    autoFocus
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={styles.amountInputReal}
                    selectionColor="#fff"
                    cursorColor="#fff"
                    onFocus={() => setIsAmountFocused(true)}
                    onBlur={() => setIsAmountFocused(false)}
                  />
                  {!isAmountFocused && amount.length === 0 && (
                    <Text style={styles.fakeZero}>0</Text>
                  )}
                </View>
              </View>
              <View style={styles.stepOneBottom}>
                <Pressable
                  disabled={!amount || parseFloat(amount) === 0}
                  onPress={nextStep}
                  style={[
                    styles.continueBtn,
                    (!amount || parseFloat(amount) === 0) && styles.continueBtnDisabled,
                  ]}
                >
                  <Text style={styles.continueText}>CONTINUE</Text>
                  <ChevronRight color="#000" size={20} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          )}

          {step === 2 && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.step2Content}>
              <Text style={styles.selectlabel}>SELECT SOURCE</Text>
              <View style={styles.categoryGridContainer}>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.name}
                      onLayout={(e) => handleTabLayout(cat.name, e)}
                      onPress={() => setCategory(cat.name)}
                      style={[styles.categoryCard, category === cat.name && styles.categoryActive]}
                    >
                      <View style={[styles.iconWrapper, category === cat.name && { backgroundColor: cat.color }]}>
                        <cat.icon size={18} strokeWidth={2} color={category === cat.name ? '#fff' : '#414141'} />
                      </View>
                      <Text 
                        style={[styles.categoryText, category === cat.name && styles.categoryTextActive]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                  <Animated.View
                    style={[
                      styles.cardDot,
                      {
                        position: 'absolute',
                        opacity: dotOpacity,
                        transform: [{ translateX: dotAnim.x }, { translateY: dotAnim.y }],
                      },
                    ]}
                  />
                </View>
              </View>
              <Pressable onPress={nextStep} style={styles.nextBtn}>
                <Text style={styles.nextText}>NEXT STEP</Text>
                <ChevronRight color="#000" size={20} strokeWidth={2} />
              </Pressable>
            </ScrollView>
          )}

      {step === 3 && (
  <View style={{ flex: 1 }}> {/* Wrapper to handle absolute positioning context */}
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.step3Content}
    >
      <Text style={styles.optionallabel}>OPTIONAL DETAILS</Text>
      <TextInput
        multiline
        value={description}
        onChangeText={setDescription}
        style={styles.textArea}
        placeholderTextColor="#555"
        placeholder='What was this for? (Optional)'
      />

      <Text style={styles.optionallabel}>TRANSACTION DATE</Text>
      <View style={styles.dateContainer}>
        <View style={styles.dateIconWrapper}>
          <Calendar color="#10b981" size={18} strokeWidth={2} />
        </View>
        <Pressable onPress={() => setShowDate(!showDate)} style={styles.dateBtn}>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Pressable>
         <ChevronRight color="#353535" size={20} strokeWidth={2} />
      </View>

      {/* The button stays in its natural position */}
     <View style={styles.confirmArea}>
  <Pressable
  onPress={handleConfirm}
  disabled={isReporting || showDate}
  style={[
    styles.confirmBtn,
    (isReporting || showDate) && { opacity: 0.6 },
  ]}
>

    {/* Hide icon and change text when reporting */}
    {!isReporting && <Sparkles color="#fff" size={20} strokeWidth={2} />}
    
    <Text style={styles.confirmText}>
      {isReporting ? 'REPORTING...' : 'CONFIRM INCOME'}
    </Text>
  </Pressable>
</View>
    </ScrollView>

    {/* The Calendar is placed here, outside the flow. 
       Because it's absolute, it will appear ON TOP of the 
       confirmBtn if the 'top' style is set correctly.
    */}
    {showDate && (
      <View style={styles.calendarOverlay}>
        <CustomCalendar
          value={date}
          onSelect={(d) => {
            setDate(d);
            setShowDate(false);
          }}
          onClose={() => setShowDate(false)}
        />
      </View>
    )}
  </View>
)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
    paddingTop: Platform.OS === 'ios' ? 60 : 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  backBtn: { 
    width: 43, 
    height: 43, 
    borderRadius: 12, 
    backgroundColor: '#080808', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderColor: "#151515", 
    borderWidth: 1 
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontFamily: 'Outfit-Black' 
  },
  steps: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginVertical: 15, 
    gap: 6, 
    marginBottom: 20 
  },
  stepDot: { 
    width: 8, 
    height: 6, 
    backgroundColor: '#222', 
    borderRadius: 3 
  },
  stepDotActive: { 
    width: 18, 
    backgroundColor: '#10b981' 
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  label: { 
    color: '#0a6f4d', 
    fontSize: 10, 
    fontFamily: 'Outfit-Black', 
    letterSpacing: 3, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  selectlabel: { 
    color: '#0a6f4d', 
    fontSize: 10, 
    fontFamily: 'Outfit-Black', 
    letterSpacing: 3, 
    marginBottom: 26 
  },
  optionallabel: { 
    color: '#0a6f4d', 
    fontSize: 10, 
    fontFamily: 'Outfit-Black', 
    letterSpacing: 3, 
    marginBottom: 16, 
    marginTop: 10 
  },
  amountWrapper: { 
    marginTop: 20, 
    width: '100%', 
    height: 120, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  currencyIcon: { 
    position: 'absolute', 
    left: 0 
  },
  amountInputReal: { 
    fontSize: 80, 
    color: '#fff', 
    fontFamily: 'Outfit-SemiBold', 
    textAlign: 'center', 
    width: '100%', 
    letterSpacing: -4 
  },
  fakeZero: { 
    position: 'absolute', 
    fontSize: 80, 
    color: '#0d0d0d', 
    fontFamily: 'Outfit-SemiBold' 
  },
  continueBtn: { 
    backgroundColor: '#fff',
    paddingVertical: 20, 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10, 
  },
  continueBtnDisabled: { 
    backgroundColor: '#333' 
  },
  continueText: { 
    color: '#000', 
    fontSize: 18, 
    fontFamily: 'Outfit-Black' 
  },
  categoryGridContainer: { 
    flex: 1, 
    marginBottom: 20 
  },
  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    position: 'relative' 
  },
  categoryCard: { 
    width: '48.5%',
    padding: 17, 
    borderRadius: 22, 
    backgroundColor: '#050505', 
    borderWidth: 1, 
    borderColor: '#121212', 
    marginBottom: 13, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    overflow: 'hidden'
  },
  categoryActive: { 
    borderColor: '#0a6f4d', 
    backgroundColor: '#141414' 
  },
  iconWrapper: { 
    width: 34, 
    height: 34, 
    borderRadius: 14, 
    backgroundColor: '#121212', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  categoryText: { 
    color: '#696969', 
    fontSize: 12, 
    fontFamily: 'Outfit-SemiBold', 
    flex: 1,
    marginRight: 10
  },
  categoryTextActive: { 
    color: '#fff' 
  },
  cardDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#10b981', 
    zIndex: 50 
  },
  step2Content: { 
    paddingBottom: 40 
  },
  nextBtn: { 
    backgroundColor: '#fff',
    paddingVertical: 20, 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10, 
  },
  nextText: { 
   color: '#000', 
    fontSize: 18, 
    fontFamily: 'Outfit-Black' 
  },
  textArea: { 
    backgroundColor: '#050505', 
    borderRadius: 16, 
    padding: 16, 
    paddingTop: 20, 
    color: '#fff', 
    minHeight: 150, 
    marginBottom: 40, 
    fontFamily: 'Outfit-SemiBold', 
    borderColor: "#121212", 
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  stepOneCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  stepOneWrapper: {
    flex: 1,
  },
  stepOneBottom: {
    paddingBottom: 30,
  },
  dateContainer: { 
    backgroundColor: '#050505', 
    borderRadius: 20, 
    padding: 23, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, // Reduced margin when calendar is visible
    borderColor: "#121212", 
    borderWidth: 1,
    zIndex: 10,
    gap:15
  },
  dateBtn: { 
    flex: 1, 
  
  },
  dateText: { 
    color: 'white', 
    fontSize: 16, 
    fontFamily: 'Outfit-Bold' 
  },
calendarOverlay: {
  position: 'absolute',
 
top: screenHeight * 0.44,
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 999,
  
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.5,
  shadowRadius: 20,
  elevation: 20,
},
confirmArea: {
  marginTop: 10,        // Ensure there is a gap
  paddingBottom: 40,    // Extra padding at the bottom for comfortable scrolling
  zIndex: 1,
},
step3Content: { 
  paddingBottom: 60     
},
  confirmBtn: { 
    backgroundColor: '#10b981', 
    height: 65, 
    borderRadius: 27, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10,
  },
  confirmText: { 
    color: '#fff', 
    fontSize: 16, 
    fontFamily: 'Outfit-Black'    
  },
  step3Content: { 
    paddingBottom: 40 
  },
  dateIconWrapper: { 
    width: 38, 
    height: 38, 
    borderRadius: 14, 
    backgroundColor: '#0b1c16', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});