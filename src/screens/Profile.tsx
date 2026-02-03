import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Modal } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  User,
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

const SettingItem = ({ icon: Icon, color, title, sub, isLast, size = 18, onPress }: any) => (
  <TouchableOpacity
    style={[styles.settingRow, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      {/* Pass the size prop here */}
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

const closeModal = () => setActiveModal(null);
const CurrencyModal = ({ onClose }: any) => (
  <>
    {/* HEADER */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Currency</Text>

      <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
        <X size={16} color="#9ca3af" strokeWidth={2}/>
      </TouchableOpacity>
    </View>

    <Text style={styles.modalSub}>
      Currently set to Indian Rupee (₹). Multi-currency support coming soon!
    </Text>

    {/* BLUE ACTION BUTTON */}
   <TouchableOpacity style={styles.primaryBtn}  onPress={onClose}>
      <Text style={styles.primaryBtnText}>Got it</Text>
    </TouchableOpacity>
  </>
);

const ExportModal = ({ onClose }: any) => {
  return (
    <>
      {/* HEADER ICON */}
      <View style={styles.exportIconWrap}>
        <Download size={28} color="#60a5fa" strokeWidth={2}/>
      </View>

      {/* TITLE */}
      <Text style={styles.modalTitle1}>Export Transactions</Text>
      <Text style={styles.modalSub}>
        Select date range or download all transactions
      </Text>

      {/* FROM DATE */}
      <Text style={styles.inputLabel}>FROM DATE</Text>
      <TouchableOpacity style={styles.dateInput}>
        <Text style={styles.datePlaceholder}>dd-mm-yyyy</Text>
        <Calendar size={16} color="black" />
      </TouchableOpacity>

      {/* TO DATE */}
      <Text style={[styles.inputLabel, { marginTop: 14 }]}>TO DATE</Text>
      <TouchableOpacity style={styles.dateInput}>
        <Text style={styles.datePlaceholder}>dd-mm-yyyy</Text>
        <Calendar size={16} color="black" />
      </TouchableOpacity>

      {/* ACTION BUTTONS */}
      <View style={styles.exportActions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn1}
          activeOpacity={0.85}
        >
          <Download size={16} color="#fff" />
          <Text style={styles.primaryBtnText1}>Download All</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const SecurityModal = ({ onClose }: any) => (
    <>
    {/* HEADER */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Security</Text>

      <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
        <X size={16} color="#9ca3af" strokeWidth={2}/>
      </TouchableOpacity>
    </View>

    <Text style={styles.modalSub}>
     Your data is stored securely. We use industry-standard encryption to protect your financial information.
    </Text>

    {/* BLUE ACTION BUTTON */}
  <TouchableOpacity style={styles.primaryBtn}  onPress={onClose}>
      <Text style={styles.primaryBtnText}>Got it</Text>
    </TouchableOpacity>
  </>
);
const HelpModal = ({ onClose }: any) => (
  <>
    {/* HEADER */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Help & Support</Text>

      <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
        <X size={16} color="#9ca3af" strokeWidth={2}/>
      </TouchableOpacity>
    </View>

    {/* Using a clean nested Text structure without restrictive props */}
   <Text style={styles.modalSub}>
  Need help? Email us at{"\u00A0"}
  <Text style={styles.email}>support@financeapp.com</Text>
  {' '}or visit our FAQ section for common questions.
</Text>

    {/* BLUE ACTION BUTTON */}
    <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
      <Text style={styles.primaryBtnText}>Got it</Text>
    </TouchableOpacity>
  </>
);
const ClearDataModal = ({ onClose }: any) => (  
   <>
      {/* HEADER ICON */}
      <View style={styles.exportIconWrap1}>
        <TriangleAlert size={28} color="#f97316" strokeWidth={2}/>
      </View>

      {/* TITLE */}
      <Text style={styles.modalTitle1}>Clear All Data?</Text>
      <Text style={styles.modalSub1}>
        This will permanently delete all your transactions, splits, and investments. This action cannot be undone.
      </Text>

      {/* ACTION BUTTONS */}
      <View style={styles.exportActions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn2}
          activeOpacity={0.85}
        >
          <Trash2 size={16} color="#fff" />
          <Text style={styles.primaryBtnText2}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </>
);
const AboutModal = ({ onClose }: any) => (
  <>
    {/* HEADER */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>About App</Text>

      <TouchableOpacity onPress={onClose} style={styles.modalCloseIcon}>
       <X size={16} color="#9ca3af" strokeWidth={2}/>
      </TouchableOpacity>
    </View>

    <Text style={styles.modalSub}>
      Finance Tracker v1.0.0
       </Text>
 <Text style={styles.modalSub}>
A simple and elegant way to track your income, expenses, and split payments with friends.</Text>
 <Text style={styles.modalSub}>
Made with care.        

</Text>

    {/* BLUE ACTION BUTTON */}
    <TouchableOpacity style={styles.primaryBtn}  onPress={onClose}>
      <Text style={styles.primaryBtnText}>Got it</Text>
    </TouchableOpacity>
  </>
);
  return (
    <SafeAreaView style={styles.container}>
    
        <Modal
  visible={activeModal !== null}
  transparent
  animationType="fade"
  onRequestClose={closeModal}
>
  <BlurView
    style={StyleSheet.absoluteFill}
    blurType="dark"
    blurAmount={4}
    reducedTransparencyFallbackColor="black"
  />

  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      {/* MODAL CONTENT SWITCH */}
      {activeModal === 'currency' && <CurrencyModal onClose={closeModal} />}
      {activeModal === 'export' && <ExportModal onClose={closeModal} />}
      {activeModal === 'security' && <SecurityModal onClose={closeModal} />}
      {activeModal === 'help' && <HelpModal onClose={closeModal} />}
      {activeModal === 'clear' && <ClearDataModal onClose={closeModal} />}
      {activeModal === 'about' && <AboutModal onClose={closeModal} />}
    </View>
  </View>
</Modal>

        {/* HEADER */}
       <View style={styles.headerWrapper}>
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={() => navigation?.goBack()}
    >
      <ChevronLeft size={20} color="#fff" strokeWidth={2} />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>Profile</Text>
    <View style={{ width: 40 }} />
  </View>

  {/* DIVIDER LINE */}
 <View style={styles.divider} />
</View>

        {/* USER INFO */}
          <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
            colors={['#397deb', '#295baa']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.avatarGradient}
          >
            <User size={36} color="#fff" strokeWidth={2} />
          </LinearGradient>

          </View>
          <Text style={styles.userName}>User</Text>
          <Text style={styles.accountType}>Personal Account</Text>
        </View>

        {/* SETTINGS GROUP */}
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.settingsCard}>
          <SettingItem 
            icon={IndianRupee} 
            color="#10b981" 
            title="Currency" 
            sub="INR (₹)" 
             onPress={() => setActiveModal('currency')}
          />
          <SettingItem 
            icon={FileText} 
            color="#3b82f6" 
            title="Export Data" 
            sub="Download CSV" 
             onPress={() => setActiveModal('export')}
          />
          <SettingItem 
            icon={Shield} 
            color="#f59e0b" 
            title="Security" 
             onPress={() => setActiveModal('security')}
          />
          <SettingItem 
            icon={CircleHelp} 
            color="#06b6d4" 
            title="Help & Support" 
             onPress={() => setActiveModal('help')}
          />
          <SettingItem 
            icon={Trash2} 
            color="#f97316" 
            title="Clear All Data" 
             onPress={() => setActiveModal('clear')}
          />
          <SettingItem 
            icon={Smartphone} 
            color="#a855f7" 
            title="About App" 
            sub="v1.0.0" 
            isLast={true} 
             onPress={() => setActiveModal('about')}
          />
        </View>

        {/* LOGOUT BUTTON */}
       <TouchableOpacity
  style={styles.logoutCard}
  activeOpacity={0.8}
  onPress={() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }], 
    });
  }}
>
  <View style={styles.logoutContent}>
    <View style={styles.logoutIconBg}>
      <LogOut size={18} color="#fff" />
    </View>
    <Text style={styles.logoutText}>Log Out</Text>
  </View>
  <ChevronRight size={18} color="#3d141a" />
</TouchableOpacity>

        <Text style={styles.footerText}>Made with care</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  backBtn: { 
    width: 40, height: 40, borderRadius: 15, 
    backgroundColor: '#101010', justifyContent: 'center', 
    alignItems: 'center', borderWidth: 1, borderColor: '#0d0d0d' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Black',  },
  headerWrapper: {
  marginBottom: 18, 
},
 divider: {
    height: 1,
    backgroundColor: '#131313',
    marginVertical: 12,
    marginHorizontal: -30, 
  },

  profileSection: { alignItems: 'center', marginTop: 5, marginBottom: 30 },

  avatarContainer: { 
    width: 85, 
    height: 85, 
    borderRadius: 35, 
    marginBottom: 10 
  },
  avatarGradient: { 
    flex: 1, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarBlue: { 
    flex: 1, backgroundColor: '#3b82f6', 
    borderRadius: 22, justifyContent: 'center', alignItems: 'center' 
  },
  userName: { color: '#fff', fontSize: 24, fontFamily: 'Outfit-Black' },
  accountType: { color: '#8a9ba2', fontSize: 14, fontFamily: 'Inter_18pt-Bold', marginTop: 4 },

  sectionLabel: { 
    color: '#8a9ba2', fontSize: 10, fontFamily: 'Inter_18pt-Black', 
    letterSpacing: 1.8, marginBottom: 15, marginLeft: 5 
  },
  settingsCard: { 
    backgroundColor: '#080808', borderRadius: 24, 
    paddingHorizontal: 16, borderWidth: 1, borderColor: '#111' 
  },
  settingRow: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#141414' 
  },
  iconContainer: { 
    width: 38, height: 38, borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center' 
  },
  settingTextContainer: { flex: 1, marginLeft: 18 },
  settingTitle: { color: '#fff', fontSize: 14, fontFamily: 'Inter_18pt-ExtraBold' },
  settingSub: { color: '#8a9ba2', fontSize: 11, marginTop: 2, fontFamily: 'Inter_18pt-Regular' },

  logoutCard: { 
    backgroundColor: '#19060a', marginTop: 20, borderRadius: 22, 
    padding: 16, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', borderWidth: 1, borderColor: '#2a0a11' 
  },
  logoutContent: { flexDirection: 'row', alignItems: 'center' },
  logoutIconBg: { 
    width: 38, height: 38, borderRadius: 15, 
    backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center' 
  },
  logoutText: { color: '#e04660', fontSize: 15, fontFamily: 'Outfit-Bold', marginLeft: 15 },
  
  footerText: { 
    color: '#333', fontSize: 10, textAlign: 'center', 
    marginTop: 40, fontFamily: 'Inter_18pt-Bold' 
  },
  modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

modalCard: {
  width: '100%',
  backgroundColor: '#121212',
  borderRadius: 24,
  padding: 24,
  borderWidth: 1,
  borderColor: '#1d1d1d',
},

modalTitle: {
  color: '#fff',
  fontSize: 20,
  fontFamily: 'Outfit-Black',
},
modalTitle1: {
  color: '#fff',
  fontSize: 20,
  fontFamily: 'Outfit-Black',
  textAlign: 'center',
},
modalSub: {
  color: '#9DA3AF',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 20,
  fontFamily: 'Inter_18pt-SemiBold',
  lineHeight: 25,
},
 email: {
    color: '#9DA3AF',
    fontWeight: '600',
  },
modalSub1: {
  color: '#9DA3AF',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 20,
  fontFamily: 'Inter_18pt-SemiBold',
  lineHeight: 25,
  textAlign: 'center',
},
modalBtn: {
  backgroundColor: '#3C83F6',
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: 'center',
  marginBottom: 12,
},

modalBtnText: {
  color: '#fff',
  fontFamily: 'Inter_18pt-Black',
},

modalClose: {
  marginTop: 10,
  alignItems: 'center',
},

modalCloseText: {
  color: '#8a9ba2',
  fontSize: 12,
},
primaryBtn: {
  marginTop: 16,
  backgroundColor: '#3b82f6', 
  paddingVertical: 13,
  borderRadius: 20,
  alignItems: 'center',
},

primaryBtnText: {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter_18pt-Black',
},
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

modalCloseIcon: {
  width: 32,
  height: 32,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#1d1d1d',
  backgroundColor: '#1e1e1e',
},
exportIconWrap: {
  alignSelf: 'center',
  width: 54,
  height: 54,
  borderRadius: 14,
  backgroundColor: '#0f1e3a',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
},
exportIconWrap1: {
  alignSelf: 'center',
  width: 54,
  height: 54,
  borderRadius: 14,
  backgroundColor: '#402512',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
},
inputLabel: {
  color: '#9DA3AF',
  fontSize: 10,
  letterSpacing: 1.4,
  marginBottom: 10,
  fontFamily: 'Inter_18pt-Black',
  marginTop: 8,
},

dateInput: {
  backgroundColor: '#191919',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 14,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#222222',
},

datePlaceholder: {
  color: '#ffffff',
  fontSize: 13,
  fontFamily: 'Inter_18pt-Black',
  
},

exportActions: {
  flexDirection: 'row',
  marginTop: 22,
  gap: 12,
},

cancelBtn: {
  flex: 1,
  backgroundColor: '#1a1a1a',
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: 'center',
},

cancelText: {
  color: '#ffffff',
  fontFamily: 'Inter_18pt-Black',
  fontSize: 14,
},
primaryBtn1: {
  flex: 1,
  backgroundColor: '#3b82f6',
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
},

primaryBtnText1: {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter_18pt-Black',
},
primaryBtn2: {
  flex: 1,
  backgroundColor: '#f97316',
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
},

primaryBtnText2: {
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter_18pt-Black',
},
});