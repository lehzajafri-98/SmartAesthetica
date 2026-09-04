
import mediapipe as mp
try:
    print("Tasks found:", mp.tasks)
    print("Vision found:", dir(mp.tasks.vision))
except Exception as e:
    print(f"Error: {e}")


