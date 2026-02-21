import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Mail, ArrowRight, Wallet } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#000000',
  inputBg: '#181818',
  textMain: '#FFFFFF',
  textSecondary: '#999999',
  primaryBlue: '#357af3',
  disabledBlue: '#1e417b',
  borderBlue: '#3B82F6',
  googleBtn: '#131314',
};

const GoogleSVG = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </Svg>
);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [keyboardOpen, setKeyboardOpen] = useState(false);

useEffect(() => {
  const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
  const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);

  const validateEmail = (text) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(text);
  };

  const handleGetOTP = async () => {
    if (isButtonDisabled || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://api.xpenly.com/api/user/send-otp', {
        email: email,
      });
      navigation.navigate('Otp', { email: email });
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !validateEmail(email);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
  contentContainerStyle={styles.scrollContent}
  bounces={false}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
  scrollEnabled={keyboardOpen}   // 👈 scroll ONLY when keyboard opens
>
            <View style={styles.topSection}>
              <View style={styles.logoRow}>
                <View style={styles.logoIcon}>
                  <Wallet color="white" size={22} strokeWidth={2.5} />
                </View>
                <Text style={styles.logoText}>xpenly</Text>
              </View>
            </View>

            {/* CENTER SECTION */}
            <View style={styles.centerSection}>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Welcome to{'\n'}xpenly</Text>
                <Text style={styles.subtitle}>Track your finances smartly</Text>
              </View>

              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <GoogleSVG />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.separatorContainer}>
                <View style={styles.line} />
                <Text style={styles.separatorText}>or use email</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <View 
                  style={[
                    styles.inputContainer, 
                    isFocused && { borderColor: COLORS.borderBlue, borderWidth: 1 }
                  ]}
                >
                  <Mail color={COLORS.textSecondary} size={18} style={styles.mailIcon} strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={'#5f5f5f'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: isButtonDisabled ? COLORS.disabledBlue : COLORS.primaryBlue }
                ]}
                disabled={isButtonDisabled || isLoading}
                activeOpacity={0.7}
                onPress={handleGetOTP}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={[
                      styles.submitButtonText,
                      { color: isButtonDisabled ? '#7088b1' : 'white' }
                    ]}>Get OTP</Text>
                    <ArrowRight color={isButtonDisabled ? '#7088b1' : 'white'} size={18} strokeWidth={2} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* BOTTOM SECTION */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Protected by enterprise-grade security</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
     paddingBottom: 40,
  },
  topSection: {
    paddingTop: 20,
    height: 100,
  },
centerSection: {
  minHeight: '70%',
  justifyContent: 'center',
    paddingTop: 12,

},

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop:10
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Inter_18pt-ExtraBold',
    letterSpacing: -0.5,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Outfit-ExtraBold',
    lineHeight: 42,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#999999',
    fontSize: 16,
    fontFamily: 'Inter_18pt-Regular'
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#131314',
    padding: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
    borderColor: '#292929',
    borderWidth: 1
  },
  googleButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Inter_18pt-SemiBold'
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  separatorText: {
    color: '#5f5f5f',
    fontSize: 14,
    marginHorizontal: 15,
    fontFamily: 'Inter_18pt-SemiBold'
  },
  inputWrapper: {
    marginBottom: 10,
  },
  label: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Inter_18pt-Regular'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1,
    borderColor: '#292929',
  },
  mailIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_18pt-Regular'
  },
  submitButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    minHeight: 56, // Ensure button doesn't shrink when showing loader
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_18pt-SemiBold'
  },
 footer: {
   marginTop: 'auto',   
   paddingVertical:'auto',
  alignItems: 'center',
},

  footerText: {   
    color: '#262626',
    fontSize: 12,
    fontFamily: 'Inter_18pt-SemiBold'
  },
});