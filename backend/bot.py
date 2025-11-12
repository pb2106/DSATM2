"""
SecureCircle Bot Detector Test - MALICIOUS MODE
================================================
Tests if BehavioGuard detects bot-like behavior by intentionally acting suspicious.

Usage:
    python securecircle_bot_test.py --url http://localhost:19006
    
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
    "app_url": "http://localhost:19006",
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
        print(f"    → Bot typing at 250 WPM: '{text}'")
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
        print(f"    → Robotic scroll: {distance}px at constant speed")
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
    
    # Find login fields
    email_strategies = [
        (By.CSS_SELECTOR, "input[type='email']"),
        (By.CSS_SELECTOR, "input[placeholder*='email' i]"),
        (By.XPATH, "//input[contains(@placeholder, 'Email')]")
    ]
    
    password_strategies = [
        (By.CSS_SELECTOR, "input[type='password']"),
        (By.CSS_SELECTOR, "input[placeholder*='password' i]")
    ]
    
    button_strategies = [
        (By.CSS_SELECTOR, "button[type='submit']"),
        (By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Sign In')]")
    ]
    
    email = find_element_safe(driver, email_strategies)
    password = find_element_safe(driver, password_strategies)
    button = find_element_safe(driver, button_strategies)
    
    if email and password and button:
        print("\n📝 Executing malicious login sequence:")
        
        # BOT BEHAVIOR #1: Instant typing (no human delay)
        behavior.bot_type_instant(email, "test@securecircle.com")
        
        # BOT BEHAVIOR #2: Zero delay between fields
        behavior.bot_type_instant(password, "Test123!")
        
        # BOT BEHAVIOR #3: Instant click
        behavior.bot_click_instant(button)
        
        time.sleep(3)
        check_for_risk_flags(driver)
        
    else:
        print("⚠ Login form not found")

def test_malicious_rapid_fire(driver):
    """Test 2: Rapid-fire actions - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 2: RAPID-FIRE BOT ACTIONS (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    print("\n🤖 Executing rapid-fire bot actions:")
    behavior.spam_actions(driver, count=30)
    
    time.sleep(2)
    check_for_risk_flags(driver)

def test_malicious_scroll_patterns(driver):
    """Test 3: Robotic scrolling - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 3: ROBOTIC SCROLL PATTERNS (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    print("\n📜 Executing robotic scroll patterns:")
    
    # Perfect consistent scrolling
    for i in range(5):
        behavior.bot_scroll_robotic(driver, distance=500)
        time.sleep(0.1)  # Fixed interval - not human-like
    
    time.sleep(2)
    check_for_risk_flags(driver)

def test_malicious_super_fast_typing(driver):
    """Test 4: Super fast typing (200+ WPM) - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 4: SUPER FAST TYPING (Should trigger detection)")
    print("="*60)
    
    behavior = MaliciousBehavior()
    
    # Find any text input
    inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='email'], textarea")
    
    if inputs:
        input_field = inputs[0]
        input_field.clear()
        
        print("\n⚡ Executing super-fast typing (250 WPM):")
        behavior.bot_type_fast(input_field, "This is incredibly fast typing that no human can do!")
        
        time.sleep(2)
        check_for_risk_flags(driver)
    else:
        print("⚠ No text input found")

def test_human_baseline(driver):
    """Test 5: Normal human behavior - SHOULD NOT GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 5: NORMAL HUMAN BEHAVIOR (Should NOT trigger detection)")
    print("="*60)
    
    behavior = HumanBehavior()
    
    # Navigate back to start
    driver.get(CONFIG["app_url"])
    time.sleep(3)
    
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
        (By.CSS_SELECTOR, "button[type='submit']"),
        (By.XPATH, "//button[contains(text(), 'Login')]")
    ]
    
    email = find_element_safe(driver, email_strategies)
    password = find_element_safe(driver, password_strategies)
    button = find_element_safe(driver, button_strategies)
    
    if email and password and button:
        print("\n👤 Executing human-like login:")
        
        # HUMAN BEHAVIOR: Natural typing with variance
        behavior.human_type_natural(email, "human@test.com")
        time.sleep(random.uniform(0.5, 1.5))  # Think between fields
        
        behavior.human_type_natural(password, "Pass123!")
        time.sleep(random.uniform(0.3, 0.8))  # Pause before clicking
        
        behavior.human_click_natural(driver, button)
        
        time.sleep(3)
        
        flagged = check_for_risk_flags(driver)
        if not flagged:
            print("✅ No flags detected - human behavior passed!")
    else:
        print("⚠ Login form not found")

def test_mixed_patterns(driver):
    """Test 6: Mixed bot/human patterns - SHOULD GET FLAGGED."""
    print("\n" + "="*60)
    print("TEST 6: MIXED BOT/HUMAN PATTERNS (Should trigger detection)")
    print("="*60)
    
    malicious = MaliciousBehavior()
    human = HumanBehavior()
    
    print("\n🎭 Executing mixed patterns:")
    
    # Start human-like
    human.human_scroll_natural(driver, 300)
    time.sleep(1)
    
    # Suddenly go bot mode
    malicious.bot_scroll_robotic(driver, 1000)
    malicious.spam_actions(driver, count=10)
    
    # Back to human
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
    print("="*70)
    
    driver = None
    
    try:
        driver = launch_app(CONFIG["app_url"], CONFIG["headless"])
        
        # Run malicious tests
        test_malicious_login(driver)
        time.sleep(2)
        
        test_malicious_super_fast_typing(driver)
        time.sleep(2)
        
        test_malicious_rapid_fire(driver)
        time.sleep(2)
        
        test_malicious_scroll_patterns(driver)
        time.sleep(2)
        
        test_mixed_patterns(driver)
        time.sleep(2)
        
        # Baseline human test
        test_human_baseline(driver)
        
        print("\n" + "="*70)
        print("✅ All tests completed!")
        print("="*70)
        print("\nCheck your BehavioGuard dashboard for flagged events.")
        print("Expected: Tests 1-4 and 6 should trigger HIGH RISK flags")
        print("Expected: Test 5 should pass with LOW/NO risk\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠ Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            print("\n🔒 Closing browser...")
            driver.quit()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test BehavioGuard bot detection")
    parser.add_argument("--url", default="http://localhost:19006", help="App URL")
    parser.add_argument("--headless", action="store_true", help="Run headless")
    args = parser.parse_args()
    
    CONFIG["app_url"] = args.url
    CONFIG["headless"] = args.headless
    
    main()
