import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Dummy training data
data = pd.DataFrame({
    'north': [10, 50, 30, 80],
    'south': [20, 10, 40, 30],
    'east':  [30, 20, 10, 60],
    'west':  [40, 30, 20, 10],
    'output': ['WEST', 'NORTH', 'SOUTH', 'EAST']
})

X = data[['north','south','east','west']]
y = data['output']

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, 'traffic_model.pkl')

print("✅ Model trained & saved")