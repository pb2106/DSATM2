import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert, SafeAreaView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, postsAPI, messagesAPI, securityAPI, adminAPI } from './services/api';

// Theme Context
const ThemeContext = createContext();
const UserContext = createContext();

const theme = {
  futuristic: {
    background: '#0A0E27',
    surface: '#141B2D',
    card: '#1E293B',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    primaryGlow: 'rgba(59, 130, 246, 0.3)',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    border: '#1E293B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    shadow: 'rgba(0,0,0,0.5)',
    gradient1: '#3B82F6',
    gradient2: '#8B5CF6',
  }
};

// Icon Components
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
    send: '➤',
    back: '←',
    menu: '☰',
    search: '🔍',
    heart: '❤️',
    plus: '+',
    logout: '🚪',
  };
  
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4, color }}>
      {icons[name] || '•'}
    </Text>
  );
};

// Navigation Component
const Navigation = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, onLogout: handleLogout }}>
      <ThemeContext.Provider value={theme.futuristic}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={theme.futuristic.background} />
          {currentScreen === 'splash' && <SplashScreen onComplete={() => setCurrentScreen('login')} />}
          {currentScreen === 'login' && <LoginScreen onLogin={(userData, riskScore) => {
            setUser(userData);
            if (riskScore > 70) setCurrentScreen('challenge');
            else setCurrentScreen('home');
          }} onRegister={() => setCurrentScreen('register')} />}
          {currentScreen === 'register' && <RegisterScreen onRegister={() => setCurrentScreen('login')} onBack={() => setCurrentScreen('login')} />}
          {currentScreen === 'challenge' && <AdaptiveChallengeScreen onComplete={() => setCurrentScreen('home')} />}
          {currentScreen === 'home' && <MainTabs currentTab="home" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'chat' && <MainTabs currentTab="chat" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'userList' && <UserListScreen onBack={() => setCurrentScreen('chat')} onSelectUser={(userId) => setCurrentScreen('chatDetail-' + userId)} />}
          {currentScreen.startsWith('chatDetail-') && <ChatDetailScreen userId={currentScreen.split('-')[1]} onBack={() => setCurrentScreen('chat')} />}
          {currentScreen === 'profile' && <MainTabs currentTab="profile" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'security' && <MainTabs currentTab="security" setCurrentTab={setCurrentScreen} />}
          {currentScreen === 'admin' && <AdminDashboardScreen onBack={() => setCurrentScreen('home')} />}
        </SafeAreaView>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

// Splash Screen
const SplashScreen = ({ onComplete }) => {
  const colors = useContext(ThemeContext);
  const [loading, setLoading] = useState(0);

  useEffect(() => {
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
        <View style={[styles.futuristicLogo, { borderColor: colors.primary, shadowColor: colors.primaryGlow }]}>
          <Text style={{ fontSize: 48 }}>🛡️</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>SecureCircle</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          AI-Powered Security Platform
        </Text>
        
        <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.loadingBar, { width: `${loading}%`, backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]} />
        </View>
        
        <View style={styles.poweredBy}>
          <Text style={[styles.poweredText, { color: colors.textSecondary }]}>
            🔒 Powered by BehavioGuard AI
          </Text>
        </View>
      </View>
    </View>
  );
};

// Register Screen
const RegisterScreen = ({ onRegister, onBack }) => {
  const colors = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.register(email, password, name);
      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: onRegister }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.authContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.authHeader}>
            <Text style={styles.authEmoji}>🛡️</Text>
            <Text style={[styles.authTitle, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
              Join the secure network
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.futuristicInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[styles.futuristicInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.futuristicInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.futuristicButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Login Screen
const LoginScreen = ({ onLogin, onRegister }) => {
  const colors = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const behavioralData = {
        typing_speed: 65 + Math.random() * 20,
        device_fingerprint: 'mobile-' + Date.now(),
        session_id: 'session-' + Date.now()
      };

      const response = await authAPI.login(email, password, behavioralData);
      
      if (response.data.requires_challenge) {
        await AsyncStorage.setItem('session_token', response.data.session_token);
        Alert.alert('Security Check', response.data.reason);
        onLogin(null, response.data.risk_score);
      } else {
        await AsyncStorage.setItem('access_token', response.data.access_token);
        await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.user, response.data.risk_score);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Unable to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.authContainer}>
          <View style={styles.authHeader}>
            <View style={[styles.futuristicLogo, { borderColor: colors.primary, shadowColor: colors.primaryGlow }]}>
              <Text style={{ fontSize: 48 }}>🛡️</Text>
            </View>
            <Text style={[styles.authTitle, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
              Sign in to continue
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.futuristicInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.futuristicInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.futuristicButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.primary, backgroundColor: 'transparent' }]}
            onPress={onRegister}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>Create New Account</Text>
          </TouchableOpacity>

          <View style={[styles.securityBadge, { backgroundColor: colors.card }]}>
            <Text style={styles.securityBadgeEmoji}>🔒</Text>
            <Text style={[styles.securityBadgeText, { color: colors.textSecondary }]}>
              Protected by AI Security
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Adaptive Challenge Screen (keeping compact due to length)
const AdaptiveChallengeScreen = ({ onComplete }) => {
  const colors = useContext(ThemeContext);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const challenges = [
    { id: 'sms', icon: '📱', title: 'SMS Verification', desc: 'Receive code via text' },
    { id: 'biometric', icon: '🔐', title: 'Biometric', desc: 'Fingerprint or Face ID' },
    { id: 'selfie', icon: '🤳', title: 'Selfie Check', desc: 'Live facial verification' },
  ];

  const handleVerify = async () => {
    if (!selectedMethod) return;
    setIsVerifying(true);
    try {
      const response = await authAPI.verifyChallenge(selectedMethod);
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      Alert.alert('Verified!', 'Identity confirmed');
      setTimeout(() => onComplete(), 500);
    } catch (error) {
      Alert.alert('Verification Failed', 'Please try again');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.challengeContainer}>
        <View style={[styles.challengeIcon, { backgroundColor: colors.warning, shadowColor: colors.warning }]}>
          <Text style={styles.challengeIconEmoji}>⚠️</Text>
        </View>
        
        <Text style={[styles.challengeTitle, { color: colors.text }]}>Additional Verification</Text>
        <Text style={[styles.challengeSubtitle, { color: colors.textSecondary }]}>
          Unusual activity detected. Please verify your identity to continue.
        </Text>

        <View style={[styles.riskBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.riskBadgeLabel, { color: colors.textSecondary }]}>Risk Level</Text>
          <Text style={[styles.riskBadgeValue, { color: colors.warning }]}>HIGH</Text>
          <Text style={[styles.riskBadgeReason, { color: colors.textSecondary }]}>
            Unusual login pattern detected
          </Text>
        </View>

        <View style={styles.challengeOptions}>
          {challenges.map(challenge => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeOption,
                { 
                  backgroundColor: colors.card,
                  borderColor: selectedMethod === challenge.id ? colors.primary : colors.border,
                  borderWidth: 2,
                  shadowColor: selectedMethod === challenge.id ? colors.primaryGlow : 'transparent'
                }
              ]}
              onPress={() => setSelectedMethod(challenge.id)}
            >
              <Text style={styles.challengeOptionIcon}>{challenge.icon}</Text>
              <Text style={[styles.challengeOptionTitle, { color: colors.text }]}>{challenge.title}</Text>
              <Text style={[styles.challengeOptionDesc, { color: colors.textSecondary }]}>{challenge.desc}</Text>
              {selectedMethod === challenge.id && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.futuristicButton,
            { 
              backgroundColor: selectedMethod ? colors.primary : colors.card,
              shadowColor: selectedMethod ? colors.primaryGlow : 'transparent'
            }
          ]}
          onPress={handleVerify}
          disabled={!selectedMethod || isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify Identity</Text>
          )}
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
        {currentTab === 'chat' && <ChatScreen onNewChat={() => setCurrentTab('userList')} />}
        {currentTab === 'profile' && <ProfileSettingsScreen onNavigateAdmin={() => setCurrentTab('admin')} />}
        {currentTab === 'security' && <BehavioralSecurityDashboardScreen />}
      </View>
      
      <View style={[styles.futuristicTabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <FuturisticTabButton icon="activity" label="Feed" active={currentTab === 'home'} onPress={() => setCurrentTab('home')} />
        <FuturisticTabButton icon="message" label="Chat" active={currentTab === 'chat'} onPress={() => setCurrentTab('chat')} />
        <FuturisticTabButton icon="shield" label="Security" active={currentTab === 'security'} onPress={() => setCurrentTab('security')} />
        <FuturisticTabButton icon="settings" label="Profile" active={currentTab === 'profile'} onPress={() => setCurrentTab('profile')} />
      </View>
    </View>
  );
};

const FuturisticTabButton = ({ icon, label, active, onPress }) => {
  const colors = useContext(ThemeContext);
  return (
    <TouchableOpacity style={styles.futuristicTabButton} onPress={onPress}>
      <View style={[
        styles.tabIconContainer,
        active && { backgroundColor: colors.primary + '20', shadowColor: colors.primaryGlow }
      ]}>
        <Icon name={icon} size={22} color={active ? colors.primary : colors.textSecondary} />
      </View>
      <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Home Feed Screen
const HomeFeedScreen = () => {
  const colors = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getPosts();
      setPosts(response.data.posts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      await postsAPI.createPost(newPost, {
        typing_speed: 60 + Math.random() * 20,
        session_id: 'session-' + Date.now()
      });
      setNewPost('');
      loadPosts();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SecureCircle</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: colors.card }]}>
            <Icon name="search" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: colors.card }]}>
            <Icon name="shield" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={[styles.createPostCard, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.createPostInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={newPost}
            onChangeText={setNewPost}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity 
            style={[styles.futuristicButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
            onPress={handleCreatePost}
            disabled={isPosting || !newPost.trim()}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {posts.map(post => (
          <View key={post.id} style={[styles.futuristicPostCard, { backgroundColor: colors.card }]}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthorInfo}>
                <Text style={styles.postAvatar}>{post.avatar}</Text>
                <View>
                  <Text style={[styles.postAuthor, { color: colors.text }]}>{post.author}</Text>
                  <Text style={[styles.postTime, { color: colors.textSecondary }]}>{post.time}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction} onPress={() => handleLike(post.id)}>
                <Text style={styles.postActionIcon}>❤️</Text>
                <Text style={[styles.postActionText, { color: colors.textSecondary }]}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Text style={styles.postActionIcon}>💬</Text>
                <Text style={[styles.postActionText, { color: colors.textSecondary }]}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction}>
                <Text style={styles.postActionIcon}>↗️</Text>
                <Text style={[styles.postActionText, { color: colors.textSecondary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Chat Screen (conversations list)
const ChatScreen = ({ onNewChat }) => {
  const colors = useContext(ThemeContext);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity 
          style={[styles.headerIconButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
          onPress={onNewChat}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyStateEmoji}>💬</Text>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Conversations Yet</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Start chatting with other users
          </Text>
          <TouchableOpacity 
            style={[styles.futuristicButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow, marginTop: 20 }]}
            onPress={onNewChat}
          >
            <Text style={styles.buttonText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={[styles.conversationCard, { backgroundColor: colors.card }]}
            >
              <Text style={styles.conversationAvatar}>{conv.avatar}</Text>
              <View style={styles.conversationInfo}>
                <Text style={[styles.conversationName, { color: colors.text }]}>{conv.name}</Text>
                <Text style={[styles.conversationLastMessage, { color: colors.textSecondary }]}>Tap to chat</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// User List Screen (NEW - for starting new conversations)
const UserListScreen = ({ onBack, onSelectUser }) => {
  const colors = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select User</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userCard, { backgroundColor: colors.card }]}
            onPress={() => onSelectUser(item.id)}
          >
            <Text style={styles.userAvatar}>{item.avatar}</Text>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Chat Detail Screen (NEW - for actual messaging)
const ChatDetailScreen = ({ userId, onBack }) => {
  const colors = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(userId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await messagesAPI.sendMessage(userId, message);
      setMessage('');
      loadMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.chatMessages}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.futuristicMessageBubble,
              msg.sender === 'me' ? 
                { backgroundColor: colors.primary, alignSelf: 'flex-end', shadowColor: colors.primaryGlow } : 
                { backgroundColor: colors.card, alignSelf: 'flex-start' }
            ]}
          >
            <Text style={[styles.messageText, { color: '#FFFFFF' }]}>{msg.text}</Text>
            <Text style={[styles.messageTime, { color: 'rgba(255,255,255,0.7)' }]}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.futuristicChatInput, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.chatInputField, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Profile Settings Screen
const ProfileSettingsScreen = ({ onNavigateAdmin }) => {
  const colors = useContext(ThemeContext);
  const { onLogout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: onLogout
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.profileAvatarLarge, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}>
          <Text style={styles.profileAvatarLargeText}>{userData?.avatar || '👤'}</Text>
        </View>
        <Text style={[styles.profileNameLarge, { color: colors.text }]}>{userData?.name || 'User'}</Text>
        <Text style={[styles.profileEmailLarge, { color: colors.textSecondary }]}>{userData?.email || 'email@example.com'}</Text>
        
        <View style={[styles.securityScoreBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <Text style={[styles.securityScoreValue, { color: colors.success }]}>
            {userData?.security_score || 50}/100
          </Text>
          <Text style={[styles.securityScoreLabel, { color: colors.success }]}>Security Score</Text>
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <Text style={[styles.settingsGroupTitle, { color: colors.textSecondary }]}>SECURITY & PRIVACY</Text>
        
        <FuturisticSettingCard colors={colors} icon="shield" title="BehavioGuard Status" value="Active" valueColor={colors.success} />
        <FuturisticSettingCard colors={colors} icon="smartphone" title="Trusted Devices" value="3 devices" />
        <FuturisticSettingCard colors={colors} icon="lock" title="Privacy Settings" value="Manage" />
        <FuturisticSettingCard colors={colors} icon="clock" title="Login History" value="View" />
        
        {userData?.is_admin && (
          <TouchableOpacity onPress={onNavigateAdmin}>
            <FuturisticSettingCard colors={colors} icon="users" title="Admin Dashboard" value="Open" valueColor={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.danger }]}
        onPress={handleLogout}
      >
        <Icon name="logout" size={20} color={colors.danger} />
        <Text style={[styles.logoutButtonText, { color: colors.danger }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const FuturisticSettingCard = ({ colors, icon, title, value, valueColor }) => (
  <TouchableOpacity style={[styles.futuristicSettingCard, { backgroundColor: colors.card }]}>
    <View style={styles.settingCardLeft}>
      <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
    </View>
    <Text style={[styles.settingValue, { color: valueColor || colors.textSecondary }]}>{value}</Text>
  </TouchableOpacity>
);

// Security Dashboard
const BehavioralSecurityDashboardScreen = () => {
  const colors = useContext(ThemeContext);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await securityAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load security dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.danger;
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
        <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: colors.card }]}>
          <Icon name="shield" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.securityScoreCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.securityScoreCardLabel, { color: colors.textSecondary }]}>Your Security Score</Text>
        <Text style={[styles.securityScoreCardValue, { color: getScoreColor(dashboard?.security_score || 0) }]}>
          {dashboard?.security_score || 0}
        </Text>
        <View style={[styles.securityScoreProgress, { backgroundColor: colors.surface }]}>
          <View style={[
            styles.securityScoreProgressFill,
            { 
              width: `${dashboard?.security_score || 0}%`,
              backgroundColor: getScoreColor(dashboard?.security_score || 0),
              shadowColor: getScoreColor(dashboard?.security_score || 0)
            }
          ]} />
        </View>
        <Text style={[styles.securityStatusText, { color: colors.textSecondary }]}>
          Status: {dashboard?.status || 'Unknown'}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <SecurityMetricCard 
          colors={colors}
          icon="activity"
          title="Typing Speed"
          value={`${dashboard?.behavioral_profile?.typing_speed || 0} WPM`}
        />
        <SecurityMetricCard 
          colors={colors}
          icon="smartphone"
          title="Device Trust"
          value={dashboard?.behavioral_profile?.device_trust || 'Unknown'}
        />
        <SecurityMetricCard 
          colors={colors}
          icon="trending"
          title="Usage Pattern"
          value={dashboard?.behavioral_profile?.usage_pattern || 'Unknown'}
        />
        <SecurityMetricCard 
          colors={colors}
          icon="clock"
          title="Sessions"
          value={`${dashboard?.behavioral_profile?.total_sessions || 0}`}
        />
      </View>
    </ScrollView>
  );
};

const SecurityMetricCard = ({ colors, icon, title, value }) => (
  <View style={[styles.metricCardFuturistic, { backgroundColor: colors.card }]}>
    <View style={[styles.metricIconContainer, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
      <Icon name={icon} size={20} color={colors.primary} />
    </View>
    <Text style={[styles.metricTitleFuturistic, { color: colors.textSecondary }]}>{title}</Text>
    <Text style={[styles.metricValueFuturistic, { color: colors.text }]}>{value}</Text>
  </View>
);

// Admin Dashboard (keeping compact)
const AdminDashboardScreen = ({ onBack }) => {
  const colors = useContext(ThemeContext);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.futuristicHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.adminStatsGrid}>
          <AdminStatCard colors={colors} label="Active Users" value={dashboard?.active_users || 0} color={colors.primary} />
          <AdminStatCard colors={colors} label="Threats Today" value={dashboard?.threats_blocked_today || 0} color={colors.danger} />
          <AdminStatCard colors={colors} label="Avg Risk" value={`${dashboard?.avg_risk_score?.toFixed(0) || 0}%`} color={colors.success} />
        </View>

        <View style={styles.settingsGroup}>
          <Text style={[styles.settingsGroupTitle, { color: colors.textSecondary }]}>RECENT THREATS</Text>
          
          {dashboard?.active_threats?.length > 0 ? (
            dashboard.active_threats.slice(0, 10).map(alert => (
              <View key={alert.id} style={[styles.threatCard, { backgroundColor: colors.card }]}>
                <View style={[
                  styles.threatBadge,
                  { 
                    backgroundColor: alert.risk_level === 'high' || alert.risk_level === 'critical' 
                      ? colors.danger + '30' 
                      : alert.risk_level === 'medium' 
                        ? colors.warning + '30' 
                        : colors.success + '30'
                  }
                ]}>
                  <Text>⚠️</Text>
                </View>
                <View style={styles.threatInfo}>
                  <Text style={[styles.threatUser, { color: colors.text }]}>{alert.user_email}</Text>
                  <Text style={[styles.threatReason, { color: colors.textSecondary }]}>{alert.reason}</Text>
                  <Text style={[styles.threatTime, { color: colors.textSecondary }]}>{alert.time}</Text>
                </View>
                <Text style={[styles.threatRisk, { color: colors.danger }]}>{alert.risk_score}%</Text>
              </View>
            ))
          ) : (
            <View style={styles.center}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No threats detected
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const AdminStatCard = ({ colors, label, value, color }) => (
  <View style={[styles.adminStatCard, { backgroundColor: colors.card }]}>
    <Text style={[styles.adminStatValue, { color }]}>{value}</Text>
    <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

// Styles (Futuristic Dark Theme)
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
  scrollContent: {
    flexGrow: 1,
  },
  // Futuristic Logo
  futuristicLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    elevation: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  // Auth
  authContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  futuristicInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  futuristicButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  backButton: {
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  securityBadgeEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  securityBadgeText: {
    fontSize: 14,
  },
  // Splash
  title: {
    fontSize: 36,
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
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 32,
  },
  loadingBar: {
    height: '100%',
    borderRadius: 2,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  poweredBy: {
    marginTop: 40,
  },
  poweredText: {
    fontSize: 14,
  },
  // Challenge
  challengeContainer: {
    padding: 24,
    paddingTop: 60,
  },
  challengeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  challengeIconEmoji: {
    fontSize: 40,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  riskBadge: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  riskBadgeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  riskBadgeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskBadgeReason: {
    fontSize: 14,
    textAlign: 'center',
  },
  challengeOptions: {
    marginBottom: 24,
  },
  challengeOption: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  challengeOptionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  challengeOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeOptionDesc: {
    fontSize: 14,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Header
  futuristicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Tab Bar
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  futuristicTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 8,
  },
  futuristicTabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIconContainer: {
    width: 48,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Posts
  createPostCard: {
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createPostInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
  },
  futuristicPostCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    fontSize: 40,
    marginRight: 12,
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
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  postActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Chat
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  conversationAvatar: {
    fontSize: 40,
    marginRight: 16,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userAvatar: {
    fontSize: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  futuristicMessageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  futuristicChatInput: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  chatInputField: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  // Profile
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  profileAvatarLargeText: {
    fontSize: 48,
  },
  profileNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmailLarge: {
    fontSize: 16,
    marginBottom: 16,
  },
  securityScoreBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
  },
  securityScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  securityScoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsGroup: {
    padding: 16,
  },
  settingsGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  futuristicSettingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  settingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Security
  securityScoreCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  securityScoreCardLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  securityScoreCardValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  securityScoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  securityScoreProgressFill: {
    height: '100%',
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  securityStatusText: {
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCardFuturistic: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  metricTitleFuturistic: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValueFuturistic: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Admin
  adminStatsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  adminStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  adminStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adminStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  threatCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  threatBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  threatInfo: {
    flex: 1,
  },
  threatUser: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  threatReason: {
    fontSize: 14,
    marginBottom: 2,
  },
  threatTime: {
    fontSize: 12,
  },
  threatRisk: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Empty States
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Navigation;
