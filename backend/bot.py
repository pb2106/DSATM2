"""
SecureCircle Bot Detector Test - MALICIOUS MODE
================================================
Tests if BehavioGuard detects bot-like behavior by intentionally acting suspicious.

Usage:
    python securecircle_bot_test.py --url http://localhost:8081
    
Behaviors:
    - Super fast typing (200+ WPM)
    - Instant clicks (no human delay)
    - Robotic scrolling patterns
    - Rapid-fire actions
    - No mouse movement variance
    - Perfect accuracy (no typos)
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import undetected_chromedriver as uc

CONFIG = {
    "app_url": "http://localhost:8081",
    "headless": False
}

# ============================================================================
# MALICIOUS BEHAVIORAL PATTERNS
# ============================================================================

class MaliciousBehavior:
    """Intentionally suspicious bot behaviors to trigger detection."""
    
    @staticmethod
    def bot_type_fast(element, text):
        """Type at 200+ WPM - clearly not human."""
        print(f"    → Bot typing at 250 WPM: '{text[:50]}...'")
        for char in text:
            element.send_keys(char)
            time.sleep(0.01)  # 10ms per char = ~600 WPM!
    
    @staticmethod
    def bot_type_instant(element, text):
        """Instant paste - most suspicious."""
        print(f"    → Instant paste: '{text}'")
        element.send_keys(text)  # No delay at all
    
    @staticmethod
    def bot_click_instant(element):
        """Click with zero delay - robotic."""
        element.click()
        # No delay after click
    
    @staticmethod
    def bot_scroll_robotic(driver, distance=1000):
        """Perfect robotic scrolling - constant speed."""
        driver.execute_script(f"window.scrollBy(0, {distance});")
        # No easing, no variance
    
    @staticmethod
    def spam_actions(driver, count=20):
        """Rapid-fire actions - clear bot behavior."""
        print(f"    → Spamming {count} actions rapidly...")
        for i in range(count):
            try:
                buttons = driver.find_elements(By.TAG_NAME, "button")
                if buttons:
                    buttons[0].click()
                time.sleep(0.05)  # 50ms between actions
            except:
                pass

class HumanBehavior:
    """Realistic human behaviors - should NOT trigger detection."""
    
    @staticmethod
    def human_type_natural(element, text):
        """Type at 50-80 WPM with variance."""
        print(f"    → Human typing at 60 WPM: '{text}'")
        for char in text:
            delay = random.uniform(0.08, 0.15)  # 60-80 WPM
            element.send_keys(char)
            time.sleep(delay)
            
            # Random pause at spaces
            if char == ' ':
                time.sleep(random.uniform(0.1, 0.3))
    
    @staticmethod
    def human_click_natural(driver, element):
        """Click with human-like delay."""
        time.sleep(random.uniform(0.2, 0.5))  # Think before click
        element.click()
        time.sleep(random.uniform(0.1, 0.3))  # Pause after
    
    @staticmethod
    def human_scroll_natural(driver, distance=500):
        """Natural scrolling with variance."""
        print(f"    → Human scroll: ~{distance}px with variance")
        steps = random.randint(8, 15)
        for _ in range(steps):
            step = distance / steps + random.randint(-20, 20)
            driver.execute_script(f"window.scrollBy(0, {step});")
            time.sleep(random.uniform(0.05, 0.15))

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def launch_app(url, headless=False):
    """Launch browser and navigate to app."""
    print(f"\n🚀 Launching app: {url}")
    
    options = uc.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    
    options.add_argument("--window-size=1280,800")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    driver = uc.Chrome(options=options)
    driver.implicitly_wait(10)
    driver.get(url)
    
    time.sleep(3)  # Wait for React to load
    print(f"✅ Loaded: {driver.title}\n")
    return driver

def find_element_safe(driver, strategies, timeout=10):
    """Try multiple selectors until one works."""
    wait = WebDriverWait(driver, timeout)
    for by, selector in strategies:
        try:
            element = wait.until(EC.presence_of_element_located((by, selector)))
            if element:
                return element
        except:
            continue
    return None

def check_for_risk_flags(driver):
    """Check if BehavioGuard flagged us."""
    try:
        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        
        # Look for risk indicators
        flags = []
        
        if "risk" in body_text and any(str(i) in body_text for i in range(70, 101)):
            flags.append("🚩 HIGH RISK SCORE DETECTED!")
        
        if "suspicious" in body_text or "unusual" in body_text:
            flags.append("🚩 SUSPICIOUS ACTIVITY FLAG!")
        
        if "challenge" in body_text or "verify" in body_text:
            flags.append("🚩 ADAPTIVE CHALLENGE TRIGGERED!")
        
        if "block" in body_text or "denied" in body_text:
            flags.append("🚩 ACCESS BLOCKED!")
        
        if "bot" in body_text or "automated" in body_text:
            flags.append("🚩 BOT DETECTED!")
        
        if flags:
            print("\n" + "="*60)
            print("🎯 SECURITY FLAGS DETECTED:")
            for flag in flags:
                print(f"   {flag}")
            print("="*60 + "\n")
            return True
        
        return False
    except:
        return False

# ============================================================================
# TEST SCENARIOS
# ============================================================================

def test_malicious_login(driver):
    """Test 1: Malicious bot-like login - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 1: MALICIOUS BOT LOGIN (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Wait for splash screen to finish
    print("⏳ Waiting for splash screen...")
    time.sleep(5)  # Wait for splash animation to complete
    
    # Find login fields
    email_strategies = [
        (By.CSS_SELECTOR, "input[type='email']"),
        (By.CSS_SELECTOR, "input[placeholder*='email' i]"),
        (By.XPATH, "//input[contains(@placeholder, 'email')]"),
        (By.XPATH, "//input[contains(@placeholder, 'Email')]")
    ]
    
    password_strategies = [
        (By.CSS_SELECTOR, "input[type='password']"),
        (By.CSS_SELECTOR, "input[placeholder*='password' i]"),
        (By.XPATH, "//input[@type='password']")
    ]
    
    button_strategies = [
        (By.XPATH, "//button[contains(text(), 'Sign In')]"),
        (By.XPATH, "//button[contains(text(), 'Login')]"),
        (By.CSS_SELECTOR, "button[type='submit']")
    ]
    
    email = find_element_safe(driver, email_strategies, timeout=15)
    password = find_element_safe(driver, password_strategies, timeout=15)
    
    if email and password:
        print("\n📝 Executing malicious login sequence:")
        
        # BOT BEHAVIOR #1: Instant typing (no human delay)
        print("    → Filling email field...")
        behavior.bot_type_instant(email, "test@securecircle.com")
        
        # BOT BEHAVIOR #2: Zero delay between fields
        print("    → Filling password field...")
        behavior.bot_type_instant(password, "Test123!")
        
        # BOT BEHAVIOR #3: Find and click login button
        button = find_element_safe(driver, button_strategies, timeout=10)
        if button:
            print("    → Clicking login button...")
            behavior.bot_click_instant(button)
        else:
            print("⚠ Login button not found, trying Enter key...")
            password.send_keys(Keys.RETURN)
        
        # Wait for navigation/response
        print("⏳ Waiting for login response...")
        time.sleep(5)
        check_for_risk_flags(driver)
        
        return True
    else:
        print("⚠ Login form not found")
        return False

def test_malicious_chat_flooding(driver):
    """Test 2: Navigate to chat and flood messages - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 2: CHAT MESSAGE FLOODING (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Find and click Chat tab
    print("\n💬 Looking for Chat tab...")
    chat_strategies = [
        (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Chat')]/ancestor::button"),
        (By.XPATH, "//div[contains(text(), 'Chat')]/ancestor::button"),
        (By.XPATH, "//*[text()='Chat']/ancestor::button"),
        (By.CSS_SELECTOR, "button[class*='TabButton']")
    ]
    
    chat_button = find_element_safe(driver, chat_strategies, timeout=10)
    
    if chat_button:
        print("    → Clicking Chat tab...")
        behavior.bot_click_instant(chat_button)
        time.sleep(3)  # Wait for chat screen to load
    else:
        print("⚠ Chat button not found")
        return False
    
    # Click "Start New Chat" or "+" button
    print("\n📝 Looking for new chat button...")
    new_chat_strategies = [
        (By.XPATH, "//button[contains(text(), 'Start New Chat')]"),
        (By.XPATH, "//button[contains(text(), 'New Chat')]"),
        (By.XPATH, "//button[contains(@class, 'headerIconButton')]"),
        (By.CSS_SELECTOR, "button[class*='headerIconButton']")
    ]
    
    new_chat_btn = find_element_safe(driver, new_chat_strategies, timeout=10)
    
    if new_chat_btn:
        print("    → Clicking new chat button...")
        behavior.bot_click_instant(new_chat_btn)
        time.sleep(3)  # Wait for user list
    else:
        print("⚠ New chat button not found")
        return False
    
    # Select a user from the list
    print("\n👤 Looking for user to chat with...")
    user_strategies = [
        (By.CSS_SELECTOR, "div[class*='userCard']"),
        (By.XPATH, "//div[contains(@class, 'userCard')]"),
        (By.CSS_SELECTOR, "button[class*='userCard']")
    ]
    
    user_card = find_element_safe(driver, user_strategies, timeout=10)
    
    if user_card:
        print("    → Selecting user...")
        behavior.bot_click_instant(user_card)
        time.sleep(3)  # Wait for chat to load
    else:
        print("⚠ User card not found")
        return False
    
    # Find message input
    print("\n⚡ Looking for message input...")
    input_strategies = [
        (By.CSS_SELECTOR, "input[placeholder*='message' i]"),
        (By.CSS_SELECTOR, "textarea[placeholder*='message' i]"),
        (By.XPATH, "//input[contains(@placeholder, 'message')]"),
        (By.CSS_SELECTOR, "input[class*='chatInputField']")
    ]
    
    message_input = find_element_safe(driver, input_strategies, timeout=10)
    
    if not message_input:
        print("⚠ Message input not found")
        return False
    
    # MALICIOUS BEHAVIOR: Rapid-fire message flooding
    print("\n🤖 Executing rapid-fire message flooding:")
    
    messages = [
        "Hello there!",
        "This is a test message",
        "Sending very quickly",
        "Bot-like behavior detected here",
        "Super fast typing speed",
        "No human can type this fast",
        "Flooding the chat now",
        "More messages incoming",
        "This should trigger flags",
        "Final flood message"
    ]
    
    for i, msg in enumerate(messages, 1):
        print(f"    → Message {i}/10: {msg[:30]}...")
        
        # Clear field
        message_input.clear()
        
        # BOT BEHAVIOR: Super fast typing
        behavior.bot_type_fast(message_input, msg)
        
        # Find send button
        send_strategies = [
            (By.CSS_SELECTOR, "button[class*='sendButton']"),
            (By.XPATH, "//button[contains(@class, 'sendButton')]"),
            (By.XPATH, "//button[last()]")
        ]
        
        send_btn = find_element_safe(driver, send_strategies, timeout=5)
        
        if send_btn:
            behavior.bot_click_instant(send_btn)
        else:
            message_input.send_keys(Keys.RETURN)
        
        # BOT BEHAVIOR: Minimal delay between messages (100ms)
        time.sleep(0.1)
    
    print("\n✅ Message flooding complete!")
    time.sleep(3)
    check_for_risk_flags(driver)
    return True

def test_malicious_scroll_patterns(driver):
    """Test 3: Robotic scrolling - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 3: ROBOTIC SCROLL PATTERNS (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Navigate to home feed
    print("\n🏠 Navigating to home feed...")
    home_strategies = [
        (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Feed')]/ancestor::button"),
        (By.XPATH, "//div[contains(text(), 'Feed')]/ancestor::button"),
        (By.XPATH, "//*[text()='Feed']/ancestor::button")
    ]
    
    home_button = find_element_safe(driver, home_strategies, timeout=10)
    if home_button:
        behavior.bot_click_instant(home_button)
        time.sleep(3)
    
    print("\n📜 Executing robotic scroll patterns:")
    
    # Perfect consistent scrolling
    for i in range(10):
        print(f"    → Robotic scroll #{i+1}")
        behavior.bot_scroll_robotic(driver, distance=500)
        time.sleep(0.05)  # Fixed interval - not human-like
    
    time.sleep(2)
    check_for_risk_flags(driver)

def test_malicious_super_fast_typing(driver):
    """Test 4: Super fast typing in posts (200+ WPM) - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 4: SUPER FAST TYPING IN POST (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Make sure we're on home feed
    print("\n🏠 Ensuring we're on home feed...")
    home_strategies = [
        (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Feed')]/ancestor::button"),
        (By.XPATH, "//*[text()='Feed']/ancestor::button")
    ]
    
    home_button = find_element_safe(driver, home_strategies, timeout=10)
    if home_button:
        behavior.bot_click_instant(home_button)
        time.sleep(3)
    
    # Find create post textarea
    print("\n📝 Looking for create post input...")
    post_strategies = [
        (By.CSS_SELECTOR, "textarea[placeholder*='mind' i]"),
        (By.CSS_SELECTOR, "textarea"),
        (By.XPATH, "//textarea[contains(@placeholder, 'mind')]"),
        (By.CSS_SELECTOR, "textarea[class*='createPostInput']")
    ]
    
    post_input = find_element_safe(driver, post_strategies, timeout=10)
    
    if post_input:
        post_input.clear()
        
        print("\n⚡ Executing super-fast typing (250 WPM):")
        long_message = "This is incredibly fast typing that no human can possibly achieve! " \
                      "I am typing at over 250 words per minute which is clearly bot behavior. " \
                      "BehavioGuard should definitely flag this as suspicious activity. " \
                      "No real person types this consistently fast without any variation. " \
                      "This is a clear sign of automated bot behavior!"
        
        behavior.bot_type_fast(post_input, long_message)
        
        # Find and click Post button
        print("\n📤 Clicking Post button...")
        post_button_strategies = [
            (By.XPATH, "//button[contains(text(), 'Post')]"),
            (By.CSS_SELECTOR, "button[class*='futuristicButton']")
        ]
        
        post_button = find_element_safe(driver, post_button_strategies, timeout=5)
        if post_button:
            behavior.bot_click_instant(post_button)
            time.sleep(3)
        
        check_for_risk_flags(driver)
    else:
        print("⚠ Post input not found")

def test_malicious_like_spam(driver):
    """Test 5: Spam like buttons - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 5: LIKE BUTTON SPAM (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Ensure we're on home feed
    print("\n🏠 Navigating to home feed...")
    home_strategies = [
        (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Feed')]/ancestor::button"),
        (By.XPATH, "//*[text()='Feed']/ancestor::button")
    ]
    
    home_button = find_element_safe(driver, home_strategies, timeout=10)
    if home_button:
        behavior.bot_click_instant(home_button)
        time.sleep(3)
    
    print("\n❤️ Finding and spamming like buttons...")
    
    # Find all like buttons
    like_buttons = driver.find_elements(By.XPATH, "//button[contains(@class, 'postAction')]")
    
    if like_buttons:
        print(f"    → Found {len(like_buttons)} action buttons")
        
        # MALICIOUS BEHAVIOR: Spam clicking like buttons
        for i in range(min(20, len(like_buttons))):
            try:
                print(f"    → Rapid click #{i+1}")
                like_buttons[i % len(like_buttons)].click()
                time.sleep(0.05)  # 50ms between clicks - clearly bot behavior
            except:
                pass
        
        print("\n✅ Like spam complete!")
        time.sleep(2)
        check_for_risk_flags(driver)
    else:
        print("⚠ No action buttons found")

def test_human_baseline(driver):
    """Test 6: Normal human behavior - SHOULD NOT GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 6: NORMAL HUMAN BEHAVIOR (Should NOT trigger detection)")
    print("="*60)
    
    behavior = HumanBehavior()
    
    # Logout first
    print("\n🚪 Logging out...")
    try:
        profile_strategies = [
            (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Profile')]/ancestor::button"),
            (By.XPATH, "//*[text()='Profile']/ancestor::button")
        ]
        
        profile_button = find_element_safe(driver, profile_strategies, timeout=10)
        if profile_button:
            profile_button.click()
            time.sleep(3)
            
            # Find logout button
            logout_strategies = [
                (By.XPATH, "//button[contains(text(), 'Log Out')]"),
                (By.XPATH, "//button[contains(@class, 'logoutButton')]")
            ]
            
            logout_button = find_element_safe(driver, logout_strategies, timeout=10)
            if logout_button:
                logout_button.click()
                time.sleep(2)
                
                # Confirm logout in alert
                try:
                    from selenium.webdriver.common.alert import Alert
                    alert = driver.switch_to.alert
                    alert.accept()
                except:
                    pass
    except:
        pass
    
    # Navigate back to login
    print("🔄 Navigating back to login...")
    driver.get(CONFIG["app_url"])
    time.sleep(5)  # Wait for splash screen
    
    # Find login fields
    email_strategies = [
        (By.CSS_SELECTOR, "input[type='email']"),
        (By.CSS_SELECTOR, "input[placeholder*='email' i]")
    ]
    
    password_strategies = [
        (By.CSS_SELECTOR, "input[type='password']"),
        (By.CSS_SELECTOR, "input[placeholder*='password' i]")
    ]
    
    button_strategies = [
        (By.XPATH, "//button[contains(text(), 'Sign In')]"),
        (By.CSS_SELECTOR, "button[type='submit']")
    ]
    
    email = find_element_safe(driver, email_strategies, timeout=15)
    password = find_element_safe(driver, password_strategies, timeout=15)
    
    if email and password:
        print("\n👤 Executing human-like login:")
        
        # HUMAN BEHAVIOR: Natural typing with variance
        behavior.human_type_natural(email, "human@test.com")
        time.sleep(random.uniform(0.5, 1.5))  # Think between fields
        
        behavior.human_type_natural(password, "Pass123!")
        time.sleep(random.uniform(0.3, 0.8))  # Pause before clicking
        
        button = find_element_safe(driver, button_strategies, timeout=10)
        if button:
            behavior.human_click_natural(driver, button)
        else:
            password.send_keys(Keys.RETURN)
        
        time.sleep(5)  # Wait for login
        
        # Human-like browsing
        print("\n🌐 Human-like browsing behavior:")
        behavior.human_scroll_natural(driver, 300)
        time.sleep(random.uniform(1, 2))
        
        behavior.human_scroll_natural(driver, 200)
        time.sleep(random.uniform(0.5, 1.5))
        
        flagged = check_for_risk_flags(driver)
        if not flagged:
            print("✅ No flags detected - human behavior passed!")
    else:
        print("⚠ Login form not found")

def test_mixed_patterns(driver):
    """Test 7: Mixed bot/human patterns - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 7: MIXED BOT/HUMAN PATTERNS (Should trigger detection)")
    print("="*60)
    
    malicious = MaliciousBehavior()
    human = HumanBehavior()
    
    print("\n🎭 Executing mixed patterns:")
    
    # Navigate to Security tab
    print("\n🛡️ Navigating to Security tab...")
    security_strategies = [
        (By.XPATH, "//button[contains(@class, 'TabButton')]//text()[contains(., 'Security')]/ancestor::button"),
        (By.XPATH, "//*[text()='Security']/ancestor::button")
    ]
    
    security_button = find_element_safe(driver, security_strategies, timeout=10)
    if security_button:
        human.human_click_natural(driver, security_button)
        time.sleep(3)
    
    # Start human-like
    print("    → Human-like scrolling...")
    human.human_scroll_natural(driver, 300)
    time.sleep(1)
    
    # Suddenly go bot mode
    print("    → Switching to bot mode!")
    malicious.bot_scroll_robotic(driver, 1000)
    
    # Rapid clicking
    print("    → Rapid clicking buttons...")
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for i in range(min(10, len(buttons))):
        try:
            buttons[i].click()
            time.sleep(0.05)
        except:
            pass
    
    # Back to human
    print("    → Back to human behavior...")
    human.human_scroll_natural(driver, 200)
    
    time.sleep(2)
    check_for_risk_flags(driver)

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Run all malicious tests."""
    print("\n" + "="*70)
    print("🔐 SecureCircle Bot Detection Test - MALICIOUS MODE")
    print("="*70)
    print("Goal: Trigger BehavioGuard by acting like a bot/attacker")
    print(f"Target: {CONFIG['app_url']}")
    print("="*70)
    
    driver = None
    
    try:
        driver = launch_app(CONFIG["app_url"], CONFIG["headless"])
        
        # Test 1: Login with bot behavior
        print("\n📋 Starting Test Sequence...")
        login_success = test_malicious_login(driver)
        
        if not login_success:
            print("\n⚠ Login failed, some tests may be skipped")
        
        time.sleep(3)
        
        # Test 2: Chat message flooding
        test_malicious_chat_flooding(driver)
        time.sleep(3)
        
        # Test 3: Robotic scrolling
        test_malicious_scroll_patterns(driver)
        time.sleep(3)
        
        # Test 4: Super fast typing in posts
        test_malicious_super_fast_typing(driver)
        time.sleep(3)
        
        # Test 5: Like button spam
        test_malicious_like_spam(driver)
        time.sleep(3)
        
        # Test 6: Mixed patterns
        test_mixed_patterns(driver)
        time.sleep(3)
        
        # Test 7: Baseline human test
        test_human_baseline(driver)
        
        print("\n" + "="*70)
        print("✅ All tests completed!")
        print("="*70)
        print("\n📊 EXPECTED RESULTS:")
        print("  ✓ Tests 1-5, 7: Should trigger HIGH RISK flags")
        print("  ✓ Test 6: Should pass with LOW/NO risk")
        print("\n🔍 Check your BehavioGuard dashboard for flagged events:")
        print("  - Login attempts with suspicious typing patterns")
        print("  - Chat flooding with high-speed messages")
        print("  - Robotic scrolling patterns")
        print("  - Super-fast post creation")
        print("  - Like button spam behavior")
        print("  - Mixed behavioral inconsistencies")
        print("\n💡 TIP: Look for risk scores above 70 and adaptive challenges\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠ Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            print("\n🔒 Keeping browser open for 10 seconds...")
            print("   (You can check the final state)")
            time.sleep(10)
            print("   Closing browser...")
            driver.quit()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test BehavioGuard bot detection")
    parser.add_argument("--url", default="http://localhost:8081", help="App URL")
    parser.add_argument("--headless", action="store_true", help="Run headless")
    args = parser.parse_args()
    
    CONFIG["app_url"] = args.url
    CONFIG["headless"] = args.headless
    
    main()