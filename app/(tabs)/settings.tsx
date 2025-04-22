import { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Scale, ChevronRight, Share2, CircleHelp as HelpCircle, Info, Shield, Dumbbell } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [useMetric, setUseMetric] = useState(true);

  const renderSettingSwitch = (
    icon: React.ReactNode,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderSettingLink = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string
  ) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        <ChevronRight size={20} color={Colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingSwitch(
            <Bell size={20} color={Colors.primary} />,
            'Push Notifications',
            notifications,
            setNotifications
          )}
          {renderSettingSwitch(
            <Moon size={20} color={Colors.primary} />,
            'Dark Mode',
            darkMode,
            setDarkMode
          )}
          {renderSettingSwitch(
            <Scale size={20} color={Colors.primary} />,
            'Use Metric System',
            useMetric,
            setUseMetric
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout</Text>
          {renderSettingLink(
            <Dumbbell size={20} color={Colors.primary} />,
            'Custom Variables',
            'Manage your exercise variables'
          )}
          {renderSettingLink(
            <Shield size={20} color={Colors.primary} />,
            'Backup & Restore',
            'Secure your workout data'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          {renderSettingLink(
            <Share2 size={20} color={Colors.primary} />,
            'Share App'
          )}
          {renderSettingLink(
            <HelpCircle size={20} color={Colors.primary} />,
            'Help & Support'
          )}
          {renderSettingLink(
            <Info size={20} color={Colors.primary} />,
            'About',
            'Version 1.0.0'
          )}
        </View>

        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  section: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    marginRight: 8,
  },
  dangerButton: {
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 100,
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.error,
  },
});