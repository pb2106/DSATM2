import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ActivityIndicator } from 'react-native';

// Theme Context
const ThemeContext = createContext();
const UserContext = createContext();

const theme = {
  dark: {
    background: '#0F0F1E',
    surface: '#1A1A2E',
    card: '#252538',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    accent: '#6C63FF',
    accentDark: '#5548CC',
    border: '#2A2A3E',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    shadow: 'rgba(0,0,0,0.5)',
  }
};

// Mock Data
const mockPosts = [
  { id: 1, author: 'Sarah Chen', avatar: '👩‍💼', content: 'Just deployed our new feature! Excited to see the impact.', time: '2h ago', likes: 24 },
  { id: 2, author: 'Alex Kumar', avatar: '👨‍💻', content: 'Anyone else working on AI security? Let\'s connect!', time: '4h ago', likes: 18 },
  { id: 3, author: 'Maya Rodriguez', avatar: '👩‍🔬', content: 'Privacy-first design is not optional anymore. It\'s a necessity.', time: '6h ago', likes: 42 },
];

const mockMessages = [
  { id: 1, text: 'Hey! How\'s the project going?', sender: 'them', time: '10:30 AM' },
  { id: 2, text: 'Great! Just finishing up the security module.', sender: 'me', time: '10:32 AM' },
  { id: 3, text: 'Awesome! Can\'t wait to see it.', sender: 'them', time: '10:35 AM' },
];

const mockAlerts = [
  { id: 1, type: 'high', user: 'user_8472', reason: 'Unusual typing pattern', risk: 85, time: '2 min ago' },
  { id: 2, type: 'medium', user: 'user_3391', reason: 'New device login', risk: 65, time: '15 min ago' },
  { id: 3, type: 'low', user: 'user_1029', reason: 'Atypical access time', risk: 42, time: '1 hr ago' },
];

// Icon Components (using emoji/text fallbacks)
const Icon = ({ name, size = 24, color = '#FFF' }) => {
  const icons = {
    shield: '🛡️',
    activity: '📊',
    message: '💬',
    settings: '⚙️',
    lock: '🔒',
    users: '👥',
    alert: '⚠️',
    trending: '📈',
    eye: '👁️',
    clock: '🕐',
    smartphone: '📱',
    check: '✓',
  };
  
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4 }}>
      {icons[name] || '•'}
    </Text>
  );
};

// Navigation Component
const Navigation = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={theme.dark}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={theme.dark.background} />
          {currentScreen === 'splash' && <SplashScreen onComplete={() => setCurrentScreen('login')} />}
          {currentScreen === 'login' && <LoginScreen onLogin={(mockRisk) => {
            setUser({ name: 'John Doe', email: 'john@example.com' });
            if (mockRisk > 70) setCurrentScreen('challenge');
            else setCurrentScreen('home');
          }} />}
          {currentScreen === 'challenge' && <AdaptiveChallengeScreen onComplete={() => setCurrentScreen('home')} />}
          {currentScreen === 'home' && <MainTabs currentTab="home" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'chat' && <MainTabs currentTab="chat" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'profile' && <MainTabs currentTab="profile" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'security' && <MainTabs currentTab="security" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'admin' && <AdminDashboardScreen onBack={() => setCurrentScreen('home')} />}
        </View>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

// Splash Screen
const SplashScreen = ({ onComplete }) => {
  const colors = useContext(ThemeContext);
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    // TODO: Initialize BehavioGuard SDK here
    // BehavioGuardSDK.initialize({ apiKey: 'xxx' })
    // Load behavioral models and device fingerprint
    
    const interval = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <View style={[styles.logoContainer, { backgroundColor: colors.accent }]}>
          <Icon name="shield" size={48} color="#FFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>SecureCircle</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Privacy-First Social Platform</Text>
        
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingBar, { width: `${loading}%`, backgroundColor: colors.accent }]} />
        </View>
        
        <View style={styles.poweredBy}>
          <Icon name="shield" size={14} color={colors.accent} />
          <Text style={[styles.poweredText, { color: colors.textSecondary }]}>Powered by BehavioGuard</Text>
        </View>
      </View>
    </View>
  );
};

// Login Screen
const LoginScreen = ({ onLogin }) => {
  const colors = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTextInput = (text, field) => {
    // TODO: Capture behavioral biometrics
    // BehavioGuard.captureTypingPattern({
    //   field: field,
    //   timestamp: Date.now(),
    //   keyPressInterval: calculateInterval(),
    //   pressureSensitivity: event.pressure
    // })
    
    if (field === 'email') setEmail(text);
    else setPassword(text);
  };

  const handleLogin = () => {
    setIsLoading(true);
    // TODO: Calculate risk score based on behavioral data
    // const risk = BehavioGuard.calculateRiskScore()
    const mockRisk = Math.random() * 100;
    setRiskScore(mockRisk);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(mockRisk);
    }, 1000);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.loginContainer}>
        <View style={[styles.logoContainer, { backgroundColor: colors.accent }]}>
          <Icon name="shield" size={40} color="#FFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Protected by AI Security</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={(text) => handleTextInput(text, 'email')}
            placeholder="your@email.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={password}
            onChangeText={(text) => handleTextInput(text, 'password')}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.riskIndicator, { backgroundColor: colors.surface }]}>
          <Icon name="shield" size={16} color={colors.accent} />
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            Risk Score: {riskScore.toFixed(0)}%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Adaptive Challenge Screen
const AdaptiveChallengeScreen = ({ onComplete }) => {
  const colors = useContext(ThemeContext);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const challenges = [
    { id: 'sms', icon: 'message', title: 'SMS Code', desc: 'Verify via text message' },
    { id: 'biometric', icon: 'shield', title: 'Biometric', desc: 'Use fingerprint or face ID' },
    { id: 'selfie', icon: 'eye', title: 'Selfie Verify', desc: 'Live facial recognition' },
  ];

  const handleVerify = () => {
    // TODO: Implement actual verification logic
    // BehavioGuard.verifyChallengeMethod(selectedMethod)
    setTimeout(() => onComplete(), 1500);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.challengeContainer}>
        <View style={[styles.alertIcon, { backgroundColor: colors.warning }]}>
          <Icon name="alert" size={32} color="#FFF" />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Additional Verification</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Unusual activity detected. Please verify your identity.
        </Text>

        <View style={[styles.riskCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.riskLabel, { color: colors.textSecondary }]}>Risk Score</Text>
          <Text style={[styles.riskValue, { color: colors.warning }]}>78%</Text>
          <Text style={[styles.riskReason, { color: colors.textSecondary }]}>
            Reason: Unusual typing pattern detected
          </Text>
        </View>

        <View style={styles.challengeOptions}>
          {challenges.map(challenge => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeCard,
                { backgroundColor: colors.card, borderColor: selectedMethod === challenge.id ? colors.accent : colors.border }
              ]}
              onPress={() => setSelectedMethod(challenge.id)}
            >
              <Icon name={challenge.icon} size={24} color={selectedMethod === challenge.id ? colors.accent : colors.textSecondary} />
              <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
              <Text style={[styles.challengeDesc, { color: colors.textSecondary }]}>{challenge.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: selectedMethod ? colors.accent : colors.border }]}
          onPress={handleVerify}
          disabled={!selectedMethod}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Main Tabs
const MainTabs = ({ currentTab, setCurrentTab }) => {
  const colors = useContext(ThemeContext);

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabContent}>
        {currentTab === 'home' && <HomeFeedScreen />}
        {currentTab === 'chat' && <ChatScreen />}
        {currentTab === 'profile' && <ProfileSettingsScreen onNavigateAdmin={() => setCurrentTab('admin')} />}
        {currentTab === 'security' && <BehavioralSecurityDashboardScreen />}
      </View>
      
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TabButton icon="activity" label="Home" active={currentTab === 'home'} onPress={() => setCurrentTab('home')} />
        <TabButton icon="message" label="Chat" active={currentTab === 'chat'} onPress={() => setCurrentTab('chat')} />
        <TabButton icon="shield" label="Security" active={currentTab === 'security'} onPress={() => setCurrentTab('security')} />
        <TabButton icon="settings" label="Profile" active={currentTab === 'profile'} onPress={() => setCurrentTab('profile')} />
      </View>
    </View>
  );
};

const TabButton = ({ icon, label, active, onPress }) => {
  const colors = useContext(ThemeContext);
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Icon name={icon} size={24} color={active ? colors.accent : colors.textSecondary} />
      <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Home Feed Screen
const HomeFeedScreen = () => {
  const colors = useContext(ThemeContext);
  const [newPost, setNewPost] = useState('');

  const handleScroll = (event) => {
    // TODO: Capture scroll behavior
    // BehavioGuard.captureScrollPattern({
    //   velocity: event.nativeEvent.velocity,
    //   direction: event.nativeEvent.contentOffset.y,
    //   timestamp: Date.now()
    // })
  };

  const handleTap = (postId) => {
    // TODO: Capture tap patterns
    // BehavioGuard.captureTapPattern({
    //   elementId: postId,
    //   timestamp: Date.now(),
    //   pressure: event.pressure
    // })
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SecureCircle</Text>
        <Icon name="shield" size={24} color={colors.accent} />
      </View>

      <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
        <View style={[styles.postInput, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={newPost}
            onChangeText={setNewPost}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {mockPosts.map(post => (
          <TouchableOpacity
            key={post.id}
            style={[styles.postCard, { backgroundColor: colors.surface }]}
            onPress={() => handleTap(post.id)}
          >
            <View style={styles.postHeader}>
              <Text style={styles.avatar}>{post.avatar}</Text>
              <View style={styles.postInfo}>
                <Text style={[styles.postAuthor, { color: colors.text }]}>{post.author}</Text>
                <Text style={[styles.postTime, { color: colors.textSecondary }]}>{post.time}</Text>
              </View>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
            <View style={styles.postFooter}>
              <Text style={[styles.postLikes, { color: colors.textSecondary }]}>❤️ {post.likes}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Chat Screen
const ChatScreen = () => {
  const colors = useContext(ThemeContext);
  const [message, setMessage] = useState('');
  const [typingStart, setTypingStart] = useState(null);

  const handleTyping = (text) => {
    if (!typingStart) setTypingStart(Date.now());
    
    // TODO: Capture typing rhythm
    // BehavioGuard.captureTypingRhythm({
    //   duration: Date.now() - typingStart,
    //   characterCount: text.length,
    //   deletionCount: text.length < message.length ? 1 : 0
    // })
    
    setMessage(text);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <Icon name="lock" size={20} color={colors.accent} />
      </View>

      <ScrollView style={styles.chatMessages}>
        {mockMessages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'me' ? 
                { backgroundColor: colors.accent, alignSelf: 'flex-end' } : 
                { backgroundColor: colors.surface, alignSelf: 'flex-start' }
            ]}
          >
            <Text style={[styles.messageText, { color: colors.text }]}>{msg.text}</Text>
            <Text style={[styles.messageTime, { color: msg.sender === 'me' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.chatFooter, { backgroundColor: colors.surface }]}>
        <Icon name="lock" size={12} color={colors.accent} />
        <Text style={[styles.encryptionBadge, { color: colors.accent }]}>
          {' '}End-to-End Encrypted
        </Text>
      </View>

      <View style={[styles.chatInput, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, flex: 1 }]}
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.accent }]}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Profile Settings Screen
const ProfileSettingsScreen = ({ onNavigateAdmin }) => {
  const colors = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile & Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.profileAvatarText}>JD</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'John Doe'}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'john@example.com'}</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
        
        <SettingCard colors={colors} icon="shield" title="BehavioGuard Status" value="Active" color={colors.success} />
        <SettingCard colors={colors} icon="smartphone" title="Trusted Devices" value="3 devices" />
        <SettingCard colors={colors} icon="trending" title="Security Score" value="94/100" color={colors.accent} />
        <SettingCard colors={colors} icon="clock" title="Login History" value="View recent" />
        
        <TouchableOpacity onPress={onNavigateAdmin}>
          <SettingCard colors={colors} icon="users" title="Admin Dashboard" value="View" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const SettingCard = ({ colors, icon, title, value, color }) => (
  <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
    <View style={styles.settingLeft}>
      <Icon name={icon} size={20} color={color || colors.textSecondary} />
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
    </View>
    <Text style={[styles.settingValue, { color: color || colors.textSecondary }]}>{value}</Text>
  </View>
);

// Behavioral Security Dashboard
const BehavioralSecurityDashboardScreen = () => {
  const colors = useContext(ThemeContext);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>BehavioGuard Dashboard</Text>
      </View>

      <View style={styles.dashboardSection}>
        <View style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Security Score</Text>
          <Text style={[styles.scoreValue, { color: colors.accent }]}>94</Text>
          <View style={[styles.progressBar, { backgroundColor: colors.card }]}>
            <View style={[styles.progressFill, { width: '94%', backgroundColor: colors.accent }]} />
          </View>
        </View>

        <MetricCard colors={colors} title="Typing Pattern" value="Normal" progress={85} icon="activity" />
        <MetricCard colors={colors} title="Device Recognition" value="Trusted" progress={100} icon="smartphone" />
        <MetricCard colors={colors} title="Behavioral Consistency" value="High" progress={92} icon="trending" />
        <MetricCard colors={colors} title="Access Patterns" value="Regular" progress={88} icon="clock" />
      </View>
    </ScrollView>
  );
};

const MetricCard = ({ colors, title, value, progress, icon }) => (
  <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
    <View style={styles.metricHeader}>
      <Icon name={icon} size={20} color={colors.accent} />
      <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
    </View>
    <Text style={[styles.metricValue, { color: colors.accent }]}>{value}</Text>
    <View style={[styles.progressBar, { backgroundColor: colors.card }]}>
      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
    </View>
  </View>
);

// Admin Dashboard Screen
const AdminDashboardScreen = ({ onBack }) => {
  const colors = useContext(ThemeContext);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.backButton, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView>
        <View style={styles.adminStats}>
          <StatCard colors={colors} label="Active Threats" value="3" color={colors.danger} />
          <StatCard colors={colors} label="Users Monitored" value="1,247" color={colors.accent} />
          <StatCard colors={colors} label="Avg Risk Score" value="24%" color={colors.success} />
        </View>

        <View style={styles.alertsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent Alerts</Text>
          {mockAlerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.surface }]}>
              <View style={[
                styles.alertBadge,
                { backgroundColor: alert.type === 'high' ? colors.danger : alert.type === 'medium' ? colors.warning : colors.success }
              ]}>
                <Icon name="alert" size={16} color="#FFF" />
              </View>
              <View style={styles.alertInfo}>
                <Text style={[styles.alertUser, { color: colors.text }]}>{alert.user}</Text>
                <Text style={[styles.alertReason, { color: colors.textSecondary }]}>{alert.reason}</Text>
                <Text style={[styles.alertTime, { color: colors.textSecondary }]}>{alert.time}</Text>
              </View>
              <Text style={[styles.alertRisk, { color: colors.danger }]}>{alert.risk}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard = ({ colors, label, value, color }) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 20,
  },
  loadingBar: {
    height: '100%',
    borderRadius: 2,
  },
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  poweredText: {
    fontSize: 14,
  },
  loginContainer: {
    padding: 24,
    paddingTop: 60,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  riskText: {
    fontSize: 14,
  },
  challengeContainer: {
    padding: 24,
    paddingTop: 60,
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  riskCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  riskLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  riskValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskReason: {
    fontSize: 14,
  },
  challengeOptions: {
    gap: 12,
    marginBottom: 20,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  challengeDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  postInput: {
    padding: 16,
    margin: 16,
    borderRadius: 16,
  },
  postCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
  },
  postLikes: {
    fontSize: 14,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  chatFooter: {
    padding: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  encryptionBadge: {
    fontSize: 12,
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  settingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dashboardSection: {
    padding: 16,
  },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  backButton: {
    fontSize: 16,
  },
  adminStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertsSection: {
    padding: 16,
  },
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  alertBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertUser: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertReason: {
    fontSize: 14,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  alertRisk: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Navigation;