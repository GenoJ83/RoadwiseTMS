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