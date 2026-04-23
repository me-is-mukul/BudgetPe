import pandas as pd
import numpy as np
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack


df = pd.read_csv("data/dataset.csv")

receivers = df["receiver"].astype(str).str.lower()
amounts = df["amount"].values
hours = df["hour"].values
labels = df["label"].values

vectorizer = TfidfVectorizer()
X_text = vectorizer.fit_transform(receivers)

X_numeric = np.array([
    [amt, hr] for amt, hr in zip(amounts, hours)
])

X = hstack([X_text, X_numeric])

model = LogisticRegression(max_iter=1000)
model.fit(X, labels)

with open("data/model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("data/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("Training complete. Model and vectorizer saved!")