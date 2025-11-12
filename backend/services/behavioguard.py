import numpy as np
from models.behavioral_data import BehavioralData
from models.security_event import SecurityEvent
from config import Config
from datetime import datetime, timedelta

class BehavioGuard:
    def __init__(self):
        self.risk_threshold_low = Config.RISK_THRESHOLD_LOW
        self.risk_threshold_medium = Config.RISK_THRESHOLD_MEDIUM
        self.risk_threshold_high = Config.RISK_THRESHOLD_HIGH
        self.risk_threshold_critical = Config.RISK_THRESHOLD_CRITICAL
    
    def analyze_login(self, user_id, behavioral_data, ip_address, device_info):
        signals = []
        risk_score = 0
        
        # Get user's baseline behavioral data
        baseline = self._get_user_baseline(user_id)
        
        # Analyze typing speed
        if behavioral_data.get('typing_speed'):
            typing_risk = self._analyze_typing_speed(
                behavioral_data['typing_speed'],
                baseline.get('avg_typing_speed', 60)
            )
            risk_score += typing_risk['score']
            if typing_risk.get('anomaly'):
                signals.append(typing_risk['message'])
        
        # Analyze device fingerprint
        if behavioral_data.get('device_fingerprint'):
            device_risk = self._analyze_device(user_id, behavioral_data['device_fingerprint'])
            risk_score += device_risk['score']
            if device_risk.get('new_device'):
                signals.append('Login from new/unknown device')
        
        # Analyze location/IP
        location_risk = self._analyze_location(user_id, ip_address)
        risk_score += location_risk['score']
        if location_risk.get('anomaly'):
            signals.append(location_risk['message'])
        
        # Analyze access time
        time_risk = self._analyze_access_time(user_id)
        risk_score += time_risk['score']
        if time_risk.get('anomaly'):
            signals.append(time_risk['message'])
        
        # Determine risk level
        risk_level = self._get_risk_level(risk_score)
        
        return {
            'risk_score': min(risk_score, 100),
            'risk_level': risk_level,
            'requires_challenge': risk_score >= self.risk_threshold_high,
            'signals': signals,
            'reason': ', '.join(signals) if signals else 'Normal login behavior'
        }
    
    def _get_user_baseline(self, user_id):
        recent_data = BehavioralData.query.filter_by(
            user_id=user_id
        ).order_by(BehavioralData.created_at.desc()).limit(50).all()
        
        if not recent_data:
            return {'avg_typing_speed': 60, 'std_typing_speed': 10}
        
        typing_speeds = [d.typing_speed for d in recent_data if d.typing_speed]
        
        return {
            'avg_typing_speed': np.mean(typing_speeds) if typing_speeds else 60,
            'std_typing_speed': np.std(typing_speeds) if len(typing_speeds) > 1 else 10
        }
    
    def _analyze_typing_speed(self, current_speed, baseline_speed):
        deviation = abs(current_speed - baseline_speed)
        threshold = baseline_speed * 0.5
        
        if deviation > threshold:
            risk_score = min((deviation / baseline_speed) * 30, 30)
            return {
                'score': risk_score,
                'anomaly': True,
                'message': f'Unusual typing speed: {current_speed:.1f} WPM (baseline: {baseline_speed:.1f} WPM)'
            }
        
        return {'score': 0, 'anomaly': False}
    
    def _analyze_device(self, user_id, device_fingerprint):
        known_device = BehavioralData.query.filter_by(
            user_id=user_id,
            device_fingerprint=device_fingerprint
        ).first()
        
        if not known_device:
            return {'score': 25, 'new_device': True}
        
        return {'score': 0, 'new_device': False}
    
    def _analyze_location(self, user_id, ip_address):
        # Check recent IPs
        recent_data = BehavioralData.query.filter_by(
            user_id=user_id
        ).order_by(BehavioralData.created_at.desc()).limit(10).all()
        
        known_ips = [d.ip_address for d in recent_data if d.ip_address]
        
        if ip_address not in known_ips and len(known_ips) > 0:
            return {
                'score': 20,
                'anomaly': True,
                'message': f'Login from new location/IP: {ip_address}'
            }
        
        return {'score': 0, 'anomaly': False}
    
    def _analyze_access_time(self, user_id):
        current_hour = datetime.utcnow().hour
        
        # Check typical access hours
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        recent_access = BehavioralData.query.filter(
            BehavioralData.user_id == user_id,
            BehavioralData.access_time >= one_week_ago
        ).all()
        
        if not recent_access:
            return {'score': 0, 'anomaly': False}
        
        typical_hours = [d.access_time.hour for d in recent_access if d.access_time]
        
        if typical_hours and current_hour not in typical_hours:
            if current_hour < 6 or current_hour > 23:
                return {
                    'score': 15,
                    'anomaly': True,
                    'message': f'Unusual access time: {current_hour}:00 (outside typical hours)'
                }
        
        return {'score': 0, 'anomaly': False}
    
    def _get_risk_level(self, risk_score):
        if risk_score < self.risk_threshold_low:
            return 'trusted'
        elif risk_score < self.risk_threshold_medium:
            return 'low'
        elif risk_score < self.risk_threshold_high:
            return 'medium'
        elif risk_score < self.risk_threshold_critical:
            return 'high'
        else:
            return 'critical'
