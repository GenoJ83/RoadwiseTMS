from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import numpy as np
import cv2
from ultralytics import YOLO
from flask_cors import CORS

# Defining  CNN class (copied from detection.ipynb)
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, 3)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(16, 32, 3)
        self.fc1 = nn.Linear(32 * 54 * 54, 64)
        self.fc2 = nn.Linear(64, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(-1, 32 * 54 * 54)
        x = self.relu(self.fc1(x))
        x = self.sigmoid(self.fc2(x))
        return x

# Loading trained model
model = CNN()
model.load_state_dict(torch.load('vehicle_cyclist_classifier.pth', map_location='cpu'))
model.eval()

# Loading YOLOv8 model for object detection
yolo_model = YOLO('ML model/yolov8n.pt')

# Defining vehicle and cyclist classes as per COCO dataset
yolo_vehicle_classes = {'car', 'truck', 'bus'}
yolo_cyclist_classes = {'bicycle', 'motorcycle'}

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (224, 224))
    img = torch.FloatTensor(img.transpose(2, 0, 1)).unsqueeze(0) / 255.0
    with torch.no_grad():
        output = model(img)
        pred = int((output > 0.5).item())
    return jsonify({'prediction': pred})  # 0=vehicle, 1=cyclist

@app.route('/detect-yolo', methods=['POST'])
def detect_yolo():
    file = request.files['image']
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    # YOLO expects a file path or a numpy array (BGR)
    results = yolo_model(img)

    vehicle_count = 0
    cyclist_count = 0
    detected_classes = []

    for r in results:
        for c in r.boxes.cls:
            class_name = yolo_model.names[int(c)]
            detected_classes.append(class_name)
            if class_name in yolo_vehicle_classes:
                vehicle_count += 1
            elif class_name in yolo_cyclist_classes:
                cyclist_count += 1

    return jsonify({
        'vehicles': vehicle_count,
        'cyclists': cyclist_count,
        'detected_classes': detected_classes
    })

if __name__ == '__main__':
    app.run(port=5000) 