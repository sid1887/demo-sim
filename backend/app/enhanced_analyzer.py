# backend/app/enhanced_analyzer.py
"""
Enhanced Circuit Analysis - Professional insights with confidence scoring
Provides detailed circuit analysis, component verification, and design recommendations
"""

import json
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class CircuitType(Enum):
    VOLTAGE_DIVIDER = "voltage_divider"
    AMPLIFIER = "amplifier" 
    FILTER = "filter"
    OSCILLATOR = "oscillator"
    POWER_SUPPLY = "power_supply"
    DIGITAL_LOGIC = "digital_logic"
    MOTOR_DRIVER = "motor_driver"
    UNKNOWN = "unknown"

@dataclass
class ComponentAnalysis:
    component_id: str
    type: str
    expected_value_range: Tuple[float, float]
    actual_value: str
    confidence: float
    issues: List[str]
    recommendations: List[str]

@dataclass
class CircuitAnalysis:
    circuit_type: CircuitType
    purpose: str
    confidence: float
    key_components: List[str]
    expected_behavior: str
    potential_issues: List[str]
    design_recommendations: List[str]
    performance_metrics: Dict[str, float]

class EnhancedCircuitAnalyzer:
    """Professional circuit analysis with domain knowledge"""
    
    def __init__(self):
        self.component_rules = self._initialize_component_rules()
        self.circuit_patterns = self._initialize_circuit_patterns()
    
    def _initialize_component_rules(self) -> Dict[str, Dict]:
        """Initialize component validation rules"""
        return {
            "resistor": {
                "typical_values": [1, 10, 100, 1000, 10000, 100000],  # ohms
                "power_ratings": [0.125, 0.25, 0.5, 1.0, 2.0],  # watts
                "tolerance": [0.01, 0.05, 0.1, 0.2],  # percentage
                "applications": ["current limiting", "voltage dividing", "pull-up/pull-down"]
            },
            "capacitor": {
                "typical_values": [1e-12, 1e-9, 1e-6, 1e-3],  # farads
                "voltage_ratings": [6.3, 10, 16, 25, 50, 100, 200, 400],  # volts
                "types": ["ceramic", "electrolytic", "tantalum", "film"],
                "applications": ["filtering", "coupling", "timing", "energy storage"]
            },
            "inductor": {
                "typical_values": [1e-6, 1e-3, 1e-2, 1e-1],  # henries
                "current_ratings": [0.1, 0.5, 1.0, 2.0, 5.0],  # amperes
                "applications": ["filtering", "energy storage", "impedance matching"]
            },
            "diode": {
                "forward_voltage": [0.3, 0.7, 1.2],  # volts
                "current_ratings": [0.1, 1.0, 3.0, 10.0],  # amperes
                "applications": ["rectification", "protection", "voltage regulation"]
            }
        }
    
    def _initialize_circuit_patterns(self) -> Dict[str, Dict]:
        """Initialize circuit pattern recognition rules"""
        return {
            "voltage_divider": {
                "components": ["resistor", "resistor"],
                "connections": "series",
                "purpose": "Divide input voltage proportionally",
                "key_formula": "Vout = Vin * (R2 / (R1 + R2))"
            },
            "rc_filter": {
                "components": ["resistor", "capacitor"],
                "connections": "series",
                "purpose": "Filter frequencies above/below cutoff",
                "key_formula": "fc = 1 / (2 * π * R * C)"
            },
            "amplifier": {
                "components": ["transistor", "resistor"],
                "minimum_components": 3,
                "purpose": "Amplify input signal",
                "key_parameters": ["gain", "bandwidth", "input_impedance"]
            }
        }
    
    def analyze_circuit_comprehensive(self, circuit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive circuit analysis"""
        
        components = circuit_data.get("components", [])
        nets = circuit_data.get("nets", [])
        wires = circuit_data.get("wires", [])
        
        # Step 1: Component Analysis
        component_analyses = []
        for comp in components:
            analysis = self._analyze_component(comp)
            component_analyses.append(analysis)
        
        # Step 2: Circuit Pattern Recognition
        circuit_analysis = self._identify_circuit_type(components, nets)
        
        # Step 3: Connection Analysis
        connection_analysis = self._analyze_connections(components, nets, wires)
        
        # Step 4: Performance Prediction
        performance = self._predict_performance(circuit_analysis, components)
        
        # Step 5: Design Recommendations
        recommendations = self._generate_recommendations(
            circuit_analysis, component_analyses, connection_analysis
        )
        
        return {
            "circuit_analysis": {
                "type": circuit_analysis.circuit_type.value,
                "purpose": circuit_analysis.purpose,
                "confidence": circuit_analysis.confidence,
                "expected_behavior": circuit_analysis.expected_behavior,
                "key_components": circuit_analysis.key_components
            },
            "component_analysis": [
                {
                    "id": comp.component_id,
                    "type": comp.type,
                    "confidence": comp.confidence,
                    "issues": comp.issues,
                    "recommendations": comp.recommendations,
                    "value_assessment": comp.actual_value
                }
                for comp in component_analyses
            ],
            "connection_analysis": connection_analysis,
            "performance_metrics": performance,
            "design_recommendations": recommendations,
            "overall_confidence": self._calculate_overall_confidence(
                circuit_analysis, component_analyses
            ),
            "analysis_metadata": {
                "components_analyzed": len(components),
                "nets_found": len(nets),
                "wires_detected": len(wires),
                "analysis_depth": "comprehensive"
            }
        }
    
    def _analyze_component(self, component: Dict[str, Any]) -> ComponentAnalysis:
        """Analyze individual component"""
        comp_type = component.get("type", "unknown").lower()
        comp_id = component.get("id", component.get("name", "unknown"))
        comp_value = component.get("value", "unknown")
        confidence = component.get("confidence", 0.8)
        
        issues = []
        recommendations = []
        
        # Check against component rules
        if comp_type in self.component_rules:
            rules = self.component_rules[comp_type]
            
            # Value validation (if parseable)
            if comp_value != "unknown":
                value_issues = self._validate_component_value(comp_type, comp_value, rules)
                issues.extend(value_issues)
        
        # Generate recommendations based on component type
        if comp_type == "resistor":
            recommendations.append("Consider using standard E24 series values")
            if confidence < 0.7:
                issues.append("Component detection confidence low - verify component type")
        
        elif comp_type == "capacitor":
            recommendations.append("Verify voltage rating exceeds circuit maximum")
            recommendations.append("Consider temperature coefficient for precision applications")
        
        return ComponentAnalysis(
            component_id=comp_id,
            type=comp_type,
            expected_value_range=(0.0, float('inf')),  # Simplified for now
            actual_value=comp_value,
            confidence=confidence,
            issues=issues,
            recommendations=recommendations
        )
    
    def _validate_component_value(self, comp_type: str, value_str: str, rules: Dict) -> List[str]:
        """Validate component value against typical ranges"""
        issues = []
        
        try:
            # Simple value parsing (would need more sophisticated parsing in production)
            numeric_value = self._parse_component_value(value_str)
            
            if comp_type == "resistor":
                if numeric_value < 1 or numeric_value > 10e6:
                    issues.append(f"Unusual resistor value: {value_str}")
            
            elif comp_type == "capacitor":
                if numeric_value < 1e-12 or numeric_value > 1e-2:
                    issues.append(f"Unusual capacitor value: {value_str}")
        
        except ValueError:
            issues.append(f"Could not parse component value: {value_str}")
        
        return issues
    
    def _parse_component_value(self, value_str: str) -> float:
        """Parse component value string to numeric value"""
        # Simplified parser - would need comprehensive implementation
        value_str = value_str.lower().replace(" ", "")
        
        multipliers = {
            'p': 1e-12, 'n': 1e-9, 'u': 1e-6, 'µ': 1e-6,
            'm': 1e-3, 'k': 1e3, 'meg': 1e6, 'g': 1e9
        }
        
        for suffix, mult in multipliers.items():
            if value_str.endswith(suffix):
                return float(value_str[:-len(suffix)]) * mult
        
        # Try direct numeric conversion
        return float(value_str.rstrip('ohmsfaradhenry'))
    
    def _identify_circuit_type(self, components: List[Dict], nets: List[str]) -> CircuitAnalysis:
        """Identify the type of circuit and its purpose"""
        
        component_types = [comp.get("type", "").lower() for comp in components]
        component_count = len(components)
        
        # Pattern matching logic
        if "resistor" in component_types and component_count == 2:
            if component_types.count("resistor") == 2:
                return CircuitAnalysis(
                    circuit_type=CircuitType.VOLTAGE_DIVIDER,
                    purpose="Divide input voltage proportionally between two resistors",
                    confidence=0.9,
                    key_components=["R1", "R2"],
                    expected_behavior="Output voltage = Input × (R2/(R1+R2))",
                    potential_issues=["Loading effects if output impedance not considered"],
                    design_recommendations=["Ensure load impedance >> R2 for accurate division"],
                    performance_metrics={"efficiency": 0.5, "linearity": 1.0}
                )
        
        if "resistor" in component_types and "capacitor" in component_types:
            return CircuitAnalysis(
                circuit_type=CircuitType.FILTER,
                purpose="RC filter for frequency response shaping",
                confidence=0.85,
                key_components=["resistor", "capacitor"],
                expected_behavior="Cutoff frequency fc = 1/(2πRC)",
                potential_issues=["Component tolerances affect cutoff frequency"],
                design_recommendations=["Use precision components for accurate filtering"],
                performance_metrics={"cutoff_accuracy": 0.8}
            )
        
        if "transistor" in component_types or "operational_amplifier" in component_types:
            return CircuitAnalysis(
                circuit_type=CircuitType.AMPLIFIER,
                purpose="Signal amplification circuit",
                confidence=0.8,
                key_components=["active_device", "bias_components"],
                expected_behavior="Amplified output signal",
                potential_issues=["Stability", "Frequency response", "Power consumption"],
                design_recommendations=["Verify bias conditions and feedback stability"],
                performance_metrics={"estimated_gain": 10.0}
            )
        
        # Default case
        return CircuitAnalysis(
            circuit_type=CircuitType.UNKNOWN,
            purpose="Circuit type not recognized - manual analysis required",
            confidence=0.4,
            key_components=component_types,
            expected_behavior="Unknown - requires expert analysis",
            potential_issues=["Circuit type identification failed"],
            design_recommendations=["Manual circuit analysis recommended"],
            performance_metrics={}
        )
    
    def _analyze_connections(self, components: List[Dict], nets: List[str], wires: List[Dict]) -> Dict[str, Any]:
        """Analyze circuit connections and topology"""
        
        return {
            "topology": "series" if len(components) <= 3 else "complex",
            "connection_count": len(wires),
            "net_count": len(nets),
            "potential_issues": [
                "Floating nodes detected" if len(nets) > len(components) + 1 else "Connections appear valid"
            ],
            "connection_confidence": 0.8
        }
    
    def _predict_performance(self, circuit_analysis: CircuitAnalysis, components: List[Dict]) -> Dict[str, float]:
        """Predict circuit performance metrics"""
        
        base_metrics = circuit_analysis.performance_metrics.copy()
        
        # Add component-based metrics
        base_metrics.update({
            "component_count_score": min(1.0, 10.0 / len(components)),  # Simpler is better
            "detection_confidence": sum(comp.get("confidence", 0.5) for comp in components) / len(components) if components else 0.0
        })
        
        return base_metrics
    
    def _generate_recommendations(self, 
                                circuit_analysis: CircuitAnalysis,
                                component_analyses: List[ComponentAnalysis],
                                connection_analysis: Dict[str, Any]) -> List[str]:
        """Generate comprehensive design recommendations"""
        
        recommendations = []
        
        # Circuit-level recommendations
        recommendations.extend(circuit_analysis.design_recommendations)
        
        # Component-level recommendations
        for comp_analysis in component_analyses:
            if comp_analysis.confidence < 0.7:
                recommendations.append(f"Verify {comp_analysis.component_id} detection accuracy")
        
        # Connection-level recommendations
        if connection_analysis["connection_confidence"] < 0.8:
            recommendations.append("Review circuit connections for accuracy")
        
        # General recommendations
        recommendations.extend([
            "Verify component specifications match application requirements",
            "Consider component tolerances in performance calculations",
            "Add test points for debugging and measurement"
        ])
        
        return list(set(recommendations))  # Remove duplicates
    
    def _calculate_overall_confidence(self, 
                                    circuit_analysis: CircuitAnalysis,
                                    component_analyses: List[ComponentAnalysis]) -> float:
        """Calculate overall analysis confidence score"""
        
        circuit_confidence = circuit_analysis.confidence
        component_confidence = sum(comp.confidence for comp in component_analyses) / len(component_analyses) if component_analyses else 0.5
        
        # Weighted average
        return (circuit_confidence * 0.6 + component_confidence * 0.4)

# Global analyzer instance
enhanced_analyzer = EnhancedCircuitAnalyzer()

def analyze_circuit_enhanced(circuit_data: Dict[str, Any]) -> Dict[str, Any]:
    """Public interface for enhanced circuit analysis"""
    return enhanced_analyzer.analyze_circuit_comprehensive(circuit_data)