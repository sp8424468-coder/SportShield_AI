import os
import uuid

TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

def save_temp_file(upload_file):
    file_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}.jpg")

    upload_file.file.seek(0)

    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())

    return file_path


def delete_file(path):
    if os.path.exists(path):
        os.remove(path)