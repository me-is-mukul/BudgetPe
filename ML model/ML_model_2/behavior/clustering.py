import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler


def normalize_features(X):
    """
    X: list of feature vectors
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled


def run_clustering(feature_vectors, n_clusters=3):
    """
    Input:
        feature_vectors = list of lists
        [
            [f1, f2, f3, ...],
            [f1, f2, f3, ...]
        ]

    Output:
        cluster labels for each user
    """

    if not feature_vectors:
        return []

    X = np.array(feature_vectors)

    X_scaled = normalize_features(X)

    model = AgglomerativeClustering(n_clusters=n_clusters)

    labels = model.fit_predict(X_scaled)

    return labels