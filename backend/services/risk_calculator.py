# Empty for now - can be expanded for advanced risk calculations
class RiskCalculator:
    @staticmethod
    def calculate_composite_risk(behavioral_scores, device_scores, location_scores):
        """
        Calculate composite risk score from multiple factors
        """
        weights = {
            'behavioral': 0.4,
            'device': 0.3,
            'location': 0.3
        }
        
        composite = (
            behavioral_scores * weights['behavioral'] +
            device_scores * weights['device'] +
            location_scores * weights['location']
        )
        
        return min(composite, 100)
