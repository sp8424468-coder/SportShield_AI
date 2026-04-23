from PIL import Image
import imagehash

def preprocess(path):
    img = Image.open(path).convert("RGB")
    img = img.resize((256, 256))
    return img

def generate_hash(img_path):
    img = preprocess(img_path)
    return str(imagehash.phash(img))


def compare_images(img1_path, img2_path):
    img1 = preprocess(img1_path)
    img2 = preprocess(img2_path)

    hash1 = imagehash.phash(img1)
    hash2 = imagehash.phash(img2)

    diff = hash1 - hash2
    similarity = (1 - diff / 64) * 100
    similarity = round(similarity, 2)

    if similarity > 85:
        status = "violation"
    elif similarity > 60:
        status = "suspicious"
    else:
        status = "safe"

    return {
        "similarity": similarity,
        "status": status
    }