from typing import Dict, Any
from config import settings

class BehavioGuard:
    """
    In-memory behavioral analysis service.
    Does not store data in database - only analyzes and returns risk scores.
    """
    
    def analyze_login(
        self,
        user_id: int,
        behavioral_data: Dict[str, Any],
        ip_address: str,
        device_info: str
    ) -> Dict[str, Any]:
        """
        Analyze login attempt and return risk assessment.
        All analysis is done in-memory without database storage.
        """
        risk_score = 0
        signals = []
        
        # Analyze typing speed
        typing_speed = behavioral_data.get('typing_speed', 0)
        if typing_speed > 0:
            if typing_speed < 50 or typing_speed > 200:
                risk_score += 20
                signals.append('unusual_typing_speed')
        
        # Analyze device fingerprint
        device_fingerprint = behavioral_data.get('device_fingerprint')
        if not device_fingerprint:
            risk_score += 10
            signals.append('missing_device_fingerprint')
        
        # Analyze IP address patterns (simplified)
        if not ip_address or ip_address == '127.0.0.1':
            risk_score += 5
        
        # Analyze time patterns
        import datetime
        hour = datetime.datetime.utcnow().hour
        if hour < 5 or hour > 23:
            risk_score += 10
            signals.append('unusual_login_time')
        
        # Determine risk level
        if risk_score >= settings.RISK_THRESHOLD_CRITICAL:
            risk_level = 'critical'
        elif risk_score >= settings.RISK_THRESHOLD_HIGH:
            risk_level = 'high'
        elif risk_score >= settings.RISK_THRESHOLD_MEDIUM:
            risk_level = 'medium'
        elif risk_score >= settings.RISK_THRESHOLD_LOW:
            risk_level = 'low'
        else:
            risk_level = 'trusted'
        
        # Determine if challenge required
        requires_challenge = risk_score >= settings.CHALLENGE_REQUIRED_THRESHOLD
        
        # Generate reason
        if signals:
            reason = f"Detected: {', '.join(signals)}"
        else:
            reason = "Normal login pattern detected"
        
        return {
            'risk_score': min(risk_score, 100),
            'risk_level': risk_level,
            'requires_challenge': requires_challenge,
            'signals': signals,
            'reason': reason
        }
    
    def analyze_behavioral_data(self, behavioral_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze general behavioral data for anomaly detection.
        Returns analysis without storing in database.
        """
        risk_score = 0
        anomalies = []
        
        # Analyze various behavioral metrics
        if behavioral_data.get('tap_pressure'):
            pressure = behavioral_data['tap_pressure']
            if pressure < 0.2 or pressure > 0.9:
                risk_score += 15
                anomalies.append('unusual_tap_pressure')
        
        if behavioral_data.get('scroll_velocity'):
            velocity = behavioral_data['scroll_velocity']
            if velocity > 1000:
                risk_score += 10
                anomalies.append('unusual_scroll_velocity')
        
        return {
            'risk_score': min(risk_score, 100),
            'anomalies': anomalies,
            'is_suspicious': risk_score > 50
        }