class ChallengeGenerator:
    def generate_challenge(self, risk_score):
        if risk_score >= 90:
            return {
                'type': 'multi_factor',
                'methods': ['sms', 'biometric', 'selfie'],
                'message': 'Critical risk detected. Multiple verification required.',
                'severity': 'critical'
            }
        elif risk_score >= 70:
            return {
                'type': 'adaptive',
                'methods': ['sms', 'biometric'],
                'message': 'Additional verification required.',
                'severity': 'high'
            }
        else:
            return {
                'type': 'simple',
                'methods': ['sms'],
                'message': 'Please verify your identity.',
                'severity': 'medium'
            }
