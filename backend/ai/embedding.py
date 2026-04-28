from PIL import Image
import torch
import clip
import numpy as np

# FORCE CPU (important for HuggingFace)
device = "cpu"

# Load model once
model, preprocess = clip.load("ViT-B/32", device=device)


def get_embedding(image_path):
    image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model.encode_image(image)

    return embedding.cpu().numpy()[0]


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))