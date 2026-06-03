import os
import numpy as np
from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)

# Global model variable
model = None

def get_risk_level_by_rules(temp, systolic_bp, spo2):
    """
    Risk score logic:
    Oxygen < 90 OR temperature > 103 OR systolic BP > 180 -> HIGH (score 71-100)
    Oxygen 90-94 OR temperature 100-103 OR systolic BP 140-180 -> MEDIUM (score 41-70)
    Everything normal -> LOW (score 0-40)
    """
    if spo2 < 90 or temp > 103 or systolic_bp > 180:
        return 2  # HIGH
    elif (90 <= spo2 <= 94) or (100 <= temp <= 103) or (140 <= systolic_bp <= 180):
        return 1  # MEDIUM
    else:
        return 0  # LOW

def train_model():
    global model
    print("Training Random Forest Classifier on dummy symptom training data...")
    
    np.random.seed(42)
    num_samples = 1500
    
    # Generate random features
    # temperature: 95.0 to 106.0 F
    temps = np.random.uniform(95.0, 106.0, num_samples)
    # systolic BP: 70 to 220 mmHg
    systolic_bps = np.random.randint(70, 220, num_samples)
    # diastolic BP: 50 to 120 mmHg
    diastolic_bps = np.random.randint(50, 120, num_samples)
    # oxygen level: 80 to 100 %
    spo2s = np.random.randint(80, 101, num_samples)
    # heart rate: 40 to 160 bpm
    heart_rates = np.random.randint(40, 160, num_samples)
    
    X = np.column_stack((temps, systolic_bps, diastolic_bps, spo2s, heart_rates))
    y = []
    
    for i in range(num_samples):
        label = get_risk_level_by_rules(temps[i], systolic_bps[i], spo2s[i])
        y.append(label)
        
    y = np.array(y)
    
    # Train the Random Forest
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    model = clf
    print("Model training complete.")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model is not trained yet."}), 500
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        temp = float(data.get('temperature', 98.6))
        systolic_bp = int(data.get('systolic_bp', 120))
        diastolic_bp = int(data.get('diastolic_bp', 80))
        oxygen_level = int(data.get('oxygen_level', 98))
        heart_rate = int(data.get('heart_rate', 80))
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid parameter format: {str(e)}"}), 400
        
    # Prepare features for prediction
    features = np.array([[temp, systolic_bp, diastolic_bp, oxygen_level, heart_rate]])
    
    # Run prediction
    pred_class = int(model.predict(features)[0])
    probabilities = model.predict_proba(features)[0]
    confidence = float(probabilities[pred_class])
    
    # Risk Level mapping
    risk_levels = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
    risk_level = risk_levels[pred_class]
    
    # Let's verify by clinical rules just in case the classifier has a minor boundary discrepancy.
    # The Random Forest is trained on this, but strict adherence to safety logic is best.
    rule_level_idx = get_risk_level_by_rules(temp, systolic_bp, oxygen_level)
    rule_level = risk_levels[rule_level_idx]
    
    # If there is a disagreement, we prioritize the rule level for patient safety
    if risk_level != rule_level:
        risk_level = rule_level
        pred_class = rule_level_idx
        confidence = float(probabilities[pred_class]) if pred_class < len(probabilities) else 0.95
        
    # Calculate a score based on level and confidence
    # LOW: 0 - 40, MEDIUM: 41 - 70, HIGH: 71 - 100
    if risk_level == "HIGH":
        # Map confidence (0.0 to 1.0) into (71 to 100)
        risk_score = int(71 + (confidence * 29))
        risk_score = min(max(risk_score, 71), 100)
    elif risk_level == "MEDIUM":
        # Map confidence (0.0 to 1.0) into (41 to 70)
        risk_score = int(41 + (confidence * 29))
        risk_score = min(max(risk_score, 41), 70)
    else:
        # Map confidence (0.0 to 1.0) into (0 to 40)
        risk_score = int(confidence * 40)
        risk_score = min(max(risk_score, 0), 40)
        
    return jsonify({
        "risk_level": risk_level,
        "risk_score": risk_score,
        "confidence": round(confidence, 4)
    })

if __name__ == '__main__':
    train_model()
    app.run(host='0.0.0.0', port=5001)
