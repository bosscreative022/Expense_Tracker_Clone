import React, { useState, useRef,useEffect,useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { ArrowLeft, ArrowRight, Shield, Wallet } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
const COLORS = {
  background: '#000000',
  primaryBlue: '#357af3',
  disabledBlue: '#1e417b',
  textSecondary: '#999999',
  inputBg: '#1a1a1a',
  border: '#292929',
  accentBlue: '#357af3',
};

export default function OTPScreen({ route, navigation }) {
  const { email } = route.params || { email: 'user@example.com' };
  const [resending, setResending] = useState(false);
const [timer, setTimer] = useState(0);
  // 1. Change array size to 4
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const inputs = useRef([]);
const { setUserToken } = useContext(AuthContext);
  useEffect(() => {
  if (timer === 0) return;

  const interval = setInterval(() => {
    setTimer(prev => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);

  const handleResendOTP = async () => {
  if (timer > 0 || resending) return;

  try {
    setResending(true);

    await axios.post(
      'https://nepenthean-undeclared-gunnar.ngrok-free.dev/api/user/send-otp',
      { email }
    );

    alert('OTP resent successfully');
    setTimer(30); // 30s cooldown
  } catch (error) {
    alert('Failed to resend OTP');
  } finally {
    setResending(false);
  }
};
const handleVerifyOTP = async () => {
  if (!isComplete || loading) return;
  setLoading(true);
  const otpString = otp.join('');

  try {
    const response = await axios.post('https://nepenthean-undeclared-gunnar.ngrok-free.dev/api/user/verify-otp', {
      email: email,
      otp: otpString,
    });

    if (response.data.success) {
      const token = response.data.token;
      // Extract userId from the nested user object based on your JSON sample
      const userId = response.data.user.id; 

      // 🔥 Console the User ID here
      console.log('✅ User ID received:', userId);
      console.log('✅ Auth Token received:', token);

      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', userId); 
      await AsyncStorage.setItem('userEmail', email);
      
      // Update global context
      setUserToken(token);
    }
  } catch (error) {
    console.error('Verify OTP Error:', error.response?.data || error.message);
    alert('Invalid OTP. Please try again.');
  } finally {
    setLoading(false);
  }
};
const handleOtpChange = (value, index) => {
  if (!/^\d?$/.test(value)) return; 

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  if (value && index < 5) {
    inputs.current[index + 1]?.focus();
  }

  // auto-submit when last digit entered
  if (value && index === 5) {
    Keyboard.dismiss();
    setTimeout(handleVerifyOTP, 150);
  }
};
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    
   <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft color={COLORS.textSecondary} size={18} strokeWidth={2} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

        

          <View style={styles.centerSection}>
            <View style={styles.iconCircle}>
               <Shield color={"#ffffff"} size={36} strokeWidth={2} />
            </View>

            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    digit !== '' && { borderColor: COLORS.primaryBlue }
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  value={digit}
                  placeholderTextColor="#444"
                  selectionColor={COLORS.primaryBlue}
                />
              ))}
            </View>

            <Text style={styles.demoText}>Enter the code sent to your email</Text>

            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { backgroundColor: isComplete ? COLORS.primaryBlue : COLORS.disabledBlue }
              ]}
              disabled={!isComplete || loading}
              activeOpacity={0.8}
              onPress={handleVerifyOTP}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={[styles.submitText, { color: isComplete ? 'white' : '#7088b1' }]}>
                    Verify & Continue
                  </Text>
                  <ArrowRight color={isComplete ? 'white' : '#7088b1'} size={18} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

           <TouchableOpacity
  style={styles.resendBtn}
  onPress={handleResendOTP}
  disabled={timer > 0 || resending}
>
  <Text style={styles.resendText}>
    {timer > 0
      ? `Resend OTP in ${timer}s`
      : "Didn't receive code? "}
    {timer === 0 && (
      <Text style={styles.resendLink}>Resend</Text>
    )}
  </Text>
</TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Protected by enterprise-grade security</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, },
  logoSection: { marginTop: 20, marginBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 48, height: 48, backgroundColor: COLORS.primaryBlue, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  backButtonContainer: { alignItems: 'flex-start', width: '100%', marginBottom: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 14, fontFamily:'Inter_18pt-SemiBold' },
  centerSection: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 25, backgroundColor: COLORS.accentBlue, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#1e417b' },
  title: { color: 'white', fontSize: 24, marginBottom: 8, letterSpacing: -0.5, fontFamily:'Outfit-Black' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 36, fontFamily:'Inter_18pt-Regular' },
  emailHighlight: { color: 'white',  fontFamily:'Inter_18pt-SemiBold'  },
  otpContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 12, 
    width: '100%', 
    marginBottom: 24 
  },
  otpBox: { 
      width: 52,
  height: 56,
  maxWidth: 60,
    backgroundColor: COLORS.inputBg, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    color: 'white', 
    fontSize: 24, 
    textAlign: 'center', 
    fontFamily:'Inter_18pt-Black'
  },
  demoText: { color: '#5f5f5f', fontSize: 12, marginBottom: 32, fontWeight: '500' },
  submitButton: { flexDirection: 'row', width: '100%', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10 },
  submitText: { fontSize: 16, fontFamily: 'Inter_18pt-SemiBold' },
  resendBtn: { marginTop: 28 },
  resendText: { color: COLORS.textSecondary, fontSize: 14 },
  resendLink: { color: COLORS.primaryBlue, fontFamily: 'Inter_18pt-Bold' },
  footer: { paddingVertical: 20, alignItems: 'center' },
  footerText: { color: '#262626', fontSize: 12, fontFamily: 'Inter_18pt-SemiBold' },
});