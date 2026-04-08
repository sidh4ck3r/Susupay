import os
from PIL import Image

image_path = r"C:\Users\SIDCOM TECHNOLOGIES\.gemini\antigravity\brain\e92cc779-cfd2-4fbc-8a3a-4dc0e7a0cd53\media__1773748315778.jpg"
output_dir = r"c:\xampp\htdocs\ndc_susu\client\public\images"
output_path = os.path.join(output_dir, "logo.png")

os.makedirs(output_dir, exist_ok=True)

try:
    img = Image.open(image_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # Threshold for "white" - adjust if needed
    threshold = 240 

    for item in datas:
        # item is (R, G, B, A)
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Image processed successfully and saved to {output_path}")

except Exception as e:
    print(f"Error processing image: {e}")
