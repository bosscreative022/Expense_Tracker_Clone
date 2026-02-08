import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Modal } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Pencil } from 'lucide-react-native';

import {
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  CircleHelp,
  Trash2,
  LogOut,
  FileText,
  Shield,
  Smartphone,
  X,
  TriangleAlert,
} from 'lucide-react-native';
import { Download, Calendar } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ReactNativeBlobUtil from 'react-native-blob-util';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

const SettingItem = ({ icon: Icon, color, title, sub, isLast, size = 18, onPress }: any) => (
  <TouchableOpacity
    style={[styles.settingRow, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Icon size={size} color="#fff" strokeWidth={2} />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      {sub && <Text style={styles.settingSub}>{sub}</Text>}
    </View>
    <ChevronRight size={18} color="#8a9ba2" />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }: any) {
  const [activeModal, setActiveModal] = useState<null | string>(null);
  const { setUserToken } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editName, setEditName] = useState('User');
  const [savingProfile, setSavingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedImage = await AsyncStorage.getItem('profileImage');

        if (storedName) setEditName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedImage) setProfileImage(storedImage);
      } catch (err) {
        console.log('❌ Failed to load profile info', err);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await API.post('/user/logout', {});
    } catch (err) {
      console.log('Logout API failed', err);
    } finally {
      await AsyncStorage.multiRemove(['userToken', 'userEmail']);
      setLoggingOut(false);
      setShowLogoutConfirm(false);
      setUserToken(null);
    }
  };

 const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    try {
      setSavingProfile(true);
      const token = await AsyncStorage.getItem('userToken');
      
      // Sending the username to the API
      const response = await API.post('/user/add-name', 
        { name: editName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Logging the result to the console as requested
      console.log('✅ Username Update Success:', response.data);

      // Updating local storage so the change reflects everywhere
      await AsyncStorage.setItem('userName', editName);
      
      closeModal();
    } catch (error) {
      console.log('❌ Update name failed:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem('profileImage', uri);
    }
  };

  const closeModal = () => setActiveModal(null);

  // --- MODAL SUB-COMPONENTS (Kept as they were) ---
  const CurrencyModal = ({ onClose }: any) => (
    <>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Currency</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
          <X size={16} color="#9ca3af" strokeWidth={2}/>
        </TouchableOpacity>
      </View>
      <Text style={styles.modalSub}>Currently set to Indian Rupee (₹). Multi-currency support coming soon!</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
        <Text style={styles.primaryBtnText}>Got it</Text>
      </TouchableOpacity>
    </>
  );

  const ExportModal = ({ onClose }: any) => {
    const [downloading, setDownloading] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null); 
    const [toDate, setToDate] = useState<Date | null>(null);
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    const formatDate = (date: Date | null) => {
      if (!date) return null;
      return date.toISOString().split('T')[0];
    };

    const handleDownloadCSV = async () => {
      const startStr = formatDate(fromDate) || '2024-01-01';
      const endStr = formatDate(toDate) || new Date().toISOString().split('T')[0];
      try {
        setDownloading(true);
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');
        let apiEndDate = endStr;
        if (toDate) {
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          apiEndDate = endOfDay.toISOString();
        }
        const fileName = `transactions_from_${startStr}_to_${endStr}.csv`;
        const url = `${API.defaults.baseURL}/user/download-csv/${userId}?startDate=${startStr}&endDate=${apiEndDate}`;
        await ReactNativeBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`,
            description: 'Downloading transaction report.',
            mime: 'text/csv',
          },
        }).fetch('GET', url, { Authorization: `Bearer ${token}` });
        onClose();
      } catch (err) {
        console.error('❌ Download Error:', err);
      } finally {
        setDownloading(false);
      }
    };

    return (
      <>
        <View style={styles.exportIconWrap}><Download size={28} color="#60a5fa" strokeWidth={2}/></View>
        <Text style={styles.modalTitle1}>Export Transactions</Text>
        <Text style={styles.modalSub}>Generating CSV with fields: Date, Type, Amount, Category, Description.</Text>
        <Text style={styles.inputLabel}>FROM DATE</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setOpenFrom(true)}>
          <Text style={styles.datePlaceholder}>{formatDate(fromDate) || 'dd-mm-yyyy'}</Text>
          <Calendar size={16} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>TO DATE</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setOpenTo(true)}>
          <Text style={styles.datePlaceholder}>{formatDate(toDate) || 'dd-mm-yyyy'}</Text>
          <Calendar size={16} color="#9ca3af" />
        </TouchableOpacity>
        <DatePicker modal mode="date" open={openFrom} date={fromDate || new Date()} theme="dark" buttonColor="#3b82f6" onConfirm={(date) => { setOpenFrom(false); setFromDate(date); }} onCancel={() => setOpenFrom(false)} />
        <DatePicker modal mode="date" open={openTo} date={toDate || new Date()} theme="dark" buttonColor="#3b82f6" onConfirm={(date) => { setOpenTo(false); setToDate(date); }} onCancel={() => setOpenTo(false)} />
        <View style={styles.exportActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={downloading}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn1} onPress={handleDownloadCSV} disabled={downloading}>
            {downloading ? <ActivityIndicator color="#fff" size="small" /> : <><Download size={16} color="#fff" /><Text style={styles.primaryBtnText1}>Download CSV</Text></>}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const SecurityModal = ({ onClose }: any) => (
    <>
      <View style={styles.modalHeader}><Text style={styles.modalTitle}>Security</Text><TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}><X size={16} color="#9ca3af" strokeWidth={2}/></TouchableOpacity></View>
      <Text style={styles.modalSub}>Your data is stored securely. We use industry-standard encryption to protect your financial information.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}><Text style={styles.primaryBtnText}>Got it</Text></TouchableOpacity>
    </>
  );

  const HelpModal = ({ onClose }: any) => (
    <>
      <View style={styles.modalHeader}><Text style={styles.modalTitle}>Help & Support</Text><TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}><X size={16} color="#9ca3af" strokeWidth={2}/></TouchableOpacity></View>
      <Text style={styles.modalSub}>Need help? Email us at <Text style={styles.email}>support@financeapp.com</Text> or visit our FAQ section.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}><Text style={styles.primaryBtnText}>Got it</Text></TouchableOpacity>
    </>
  );

  const ClearDataModal = ({ onClose }: any) => (
    <>
      <View style={styles.exportIconWrap1}><TriangleAlert size={28} color="#f97316" strokeWidth={2}/></View>
      <Text style={styles.modalTitle1}>Clear All Data?</Text>
      <Text style={styles.modalSub1}>This will permanently delete all your transactions. This action cannot be undone.</Text>
      <View style={styles.exportActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn2}><Trash2 size={16} color="#fff" /><Text style={styles.primaryBtnText2}>Clear All</Text></TouchableOpacity>
      </View>
    </>
  );

  const AboutModal = ({ onClose }: any) => (
    <>
      <View style={styles.modalHeader}><Text style={styles.modalTitle}>About App</Text><TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}><X size={16} color="#9ca3af" strokeWidth={2}/></TouchableOpacity></View>
      <Text style={styles.modalSub}>Finance Tracker v1.0.0{'\n'}A simple and elegant way to track your income and expenses.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}><Text style={styles.primaryBtnText}>Got it</Text></TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <Modal 
          visible={activeModal !== null} 
          transparent 
          animationType="fade" 
          onRequestClose={closeModal}
        >
          <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={4} reducedTransparencyFallbackColor="black" />
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {activeModal === 'currency' && <CurrencyModal onClose={closeModal} />}
              {activeModal === 'export' && <ExportModal onClose={closeModal} />}
              {activeModal === 'security' && <SecurityModal onClose={closeModal} />}
              {activeModal === 'help' && <HelpModal onClose={closeModal} />}
              {activeModal === 'clear' && <ClearDataModal onClose={closeModal} />}
              {activeModal === 'about' && <AboutModal onClose={closeModal} />}
              
              {/* EDIT PROFILE MODAL CONTENT INLINED TO FIX KEYBOARD */}
              {activeModal === 'editProfile' && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.modalCloseIcon}>
                      <X size={16} color="#9ca3af" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <View style={styles.modalAvatarBox}>
                      {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.modalAvatarInitial}>{editName.charAt(0).toUpperCase()}</Text>
                      )}
                      {/* Camera icon matches reference placement */}
                      <TouchableOpacity style={styles.modalCameraIcon} onPress={pickImage}>
                        <Camera size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>DISPLAY NAME</Text>
                  <View style={styles.dateInput}>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter name"
                      placeholderTextColor="#6b7280"
                      style={styles.modalTextInput}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryBtn, { marginTop: 20, opacity: savingProfile ? 0.6 : 1 }]}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Profile</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* HEADER */}
          <View style={styles.headerWrapper}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                <ChevronLeft size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.divider} />
          </View>

          {/* USER INFO - CENTERED */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#397deb', '#295baa']} style={styles.avatarGradient}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{editName.charAt(0).toUpperCase()}</Text>
                )}
              </LinearGradient>
              {/* Only the pencil is clickable */}
              <TouchableOpacity style={styles.editIcon} onPress={() => setActiveModal('editProfile')}>
                <Pencil size={12} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.userName}>{editName}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>

          {/* SETTINGS GROUP */}
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingItem icon={IndianRupee} color="#10b981" title="Currency" sub="INR (₹)" onPress={() => setActiveModal('currency')} />
            <SettingItem icon={FileText} color="#3b82f6" title="Export Data" sub="Download CSV" onPress={() => setActiveModal('export')} />
            <SettingItem icon={Shield} color="#f59e0b" title="Security" onPress={() => setActiveModal('security')} />
            <SettingItem icon={CircleHelp} color="#06b6d4" title="Help & Support" onPress={() => setActiveModal('help')} />
            <SettingItem icon={Trash2} color="#f97316" title="Clear All Data" onPress={() => setActiveModal('clear')} />
            <SettingItem icon={Smartphone} color="#a855f7" title="About App" sub="v1.0.0" isLast={true} onPress={() => setActiveModal('about')} />
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutCard} activeOpacity={0.8} onPress={() => setShowLogoutConfirm(true)}>
            <View style={styles.logoutContent}>
              <View style={styles.logoutIconBg}><LogOut size={18} color="#fff" /></View>
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
            <ChevronRight size={18} color="#3d141a" />
          </TouchableOpacity>

          <Text style={styles.footerText}>Made with care</Text>
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* LOGOUT MODAL */}
        <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirm(false)}>
          <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={4} />
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.exportIconWrap1}><LogOut size={28} color="#f43f5e" /></View>
              <Text style={styles.modalTitle1}>Are you sure?</Text>
              <Text style={styles.modalSub1}>You will be logged out of your account.</Text>
              <View style={styles.exportActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutConfirm(false)} disabled={loggingOut}><Text style={styles.cancelText}>No</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn2} onPress={handleLogout} disabled={loggingOut}>
                  {loggingOut ? <ActivityIndicator color="#fff" /> : <><LogOut size={16} color="#fff" /><Text style={styles.primaryBtnText2}>Yes, Logout</Text></>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  headerWrapper: { paddingHorizontal: 20, marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 15, backgroundColor: '#101010', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Black' },
  divider: { height: 1, backgroundColor: '#131313', marginTop: 15, marginHorizontal: -20 },
  
  profileSection: { alignItems: 'center', marginTop: 5, marginBottom: 30 },
  avatarContainer: { width: 90, height: 90, borderRadius: 30, marginBottom: 12 },
  avatarGradient: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 30 },
  avatarInitial: { color: '#fff', fontSize: 36, fontFamily: 'Outfit-Black' },
  
  userName: { color: '#fff', fontSize: 24, fontFamily: 'Outfit-Black', textAlign: 'center' },
  userEmail: { color: '#8a9ba2', fontSize: 13, marginTop: 4, fontFamily: 'Inter_18pt-SemiBold', textAlign: 'center' },
  
  editIcon: { 
    position: 'absolute', bottom: -2, right: -2, 
    backgroundColor: '#3b82f6', width: 26, height: 26, 
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', 
    borderWidth: 2, borderColor: '#000' 
  },

  sectionLabel: { color: '#8a9ba2', fontSize: 10, fontFamily: 'Inter_18pt-Black', letterSpacing: 1.8, marginBottom: 15, marginLeft: 25 },
  settingsCard: { backgroundColor: '#080808', borderRadius: 24, paddingHorizontal: 16, marginHorizontal: 20, borderWidth: 1, borderColor: '#111' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#141414' },
  iconContainer: { width: 38, height: 38, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginLeft: 18 },
  settingTitle: { color: '#fff', fontSize: 14, fontFamily: 'Inter_18pt-ExtraBold' },
  settingSub: { color: '#8a9ba2', fontSize: 11, marginTop: 2, fontFamily: 'Inter_18pt-Regular' },

  logoutCard: { backgroundColor: '#19060a', marginHorizontal: 20, marginTop: 20, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#2a0a11' },
  logoutContent: { flexDirection: 'row', alignItems: 'center' },
  logoutIconBg: { width: 38, height: 38, borderRadius: 15, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#e04660', fontSize: 15, fontFamily: 'Outfit-Bold', marginLeft: 15 },
  footerText: { color: '#333', fontSize: 10, textAlign: 'center', marginTop: 40, fontFamily: 'Inter_18pt-Bold' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#121212', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#1d1d1d' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#fff', fontSize: 20, fontFamily: 'Outfit-Black' },
  modalTitle1: { color: '#fff', fontSize: 20, fontFamily: 'Outfit-Black', textAlign: 'center' },
  modalSub: { color: '#9DA3AF', fontSize: 14, marginTop: 15, marginBottom: 20, fontFamily: 'Inter_18pt-SemiBold', lineHeight: 22 },
  modalSub1: { color: '#9DA3AF', fontSize: 14, marginTop: 15, marginBottom: 20, fontFamily: 'Inter_18pt-SemiBold', lineHeight: 22, textAlign: 'center' },
  email: { color: '#3b82f6', fontWeight: '600' },
  
  modalCloseIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1d1d1d', backgroundColor: '#1e1e1e' },
  modalAvatarBox: { width: 100, height: 100, borderRadius: 32, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  modalAvatarInitial: { color: '#fff', fontSize: 40, fontFamily: 'Outfit-Black' },
  modalCameraIcon: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#3b82f6', borderRadius: 12, padding: 8, borderWidth: 3, borderColor: '#121212' },
  modalTextInput: { color: '#fff', fontFamily: 'Inter_18pt-Black', flex: 1, fontSize: 15 },
  
  inputLabel: { color: '#9DA3AF', fontSize: 10, letterSpacing: 1.4, marginBottom: 10, fontFamily: 'Inter_18pt-Black', marginTop: 8 },
  dateInput: { backgroundColor: '#191919', borderRadius: 14, paddingHorizontal: 14, height: 55, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  datePlaceholder: { color: '#fff', fontSize: 13, fontFamily: 'Inter_18pt-Black' },
  
  primaryBtn: { backgroundColor: '#3b82f6', height: 55, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_18pt-Black' },
  primaryBtn1: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 16, height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primaryBtnText1: { color: '#fff', fontSize: 14, fontFamily: 'Inter_18pt-Black' },
  primaryBtn2: { flex: 1, backgroundColor: '#f43f5e', borderRadius: 16, height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primaryBtnText2: { color: '#fff', fontSize: 14, fontFamily: 'Inter_18pt-Black' },
  cancelBtn: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, height: 50, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#ffffff', fontFamily: 'Inter_18pt-Black', fontSize: 14 },
  exportActions: { flexDirection: 'row', marginTop: 22, gap: 12 },
  exportIconWrap: { alignSelf: 'center', width: 54, height: 54, borderRadius: 14, backgroundColor: '#0f1e3a', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  exportIconWrap1: { alignSelf: 'center', width: 54, height: 54, borderRadius: 14, backgroundColor: '#2a0a11', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
});