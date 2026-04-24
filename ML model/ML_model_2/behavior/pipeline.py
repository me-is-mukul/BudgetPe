from ML_model_2.behavior.feature_engineering import build_user_features
from ML_model_2.behavior.clustering import run_clustering
from ML_model_2.behavior.persona_mapping import (
    get_cluster_stats,
    map_cluster_to_persona,
    assign_persona_to_users
)
def behavior_pipeline(user_transactions):
    """
    Input:
        user_transactions = {
            "user1": [txn1, txn2, ...],
            "user2": [txn1, txn2, ...],
        }

    Output:
        {
            "user1": "Impulse Eater",
            "user2": "Big Spender",
        }
    """

    feature_vectors = []
    user_ids = []

    for user, transactions in user_transactions.items():
        features = build_user_features(transactions)

        if features: 
            feature_vectors.append(features)
            user_ids.append(user)

    if len(feature_vectors) < 2:
        return {"error": "Not enough users for clustering"}

    n_clusters = min(3, len(feature_vectors))
    labels = run_clustering(feature_vectors, n_clusters=n_clusters)

    cluster_stats = get_cluster_stats(feature_vectors, labels)

    persona_map = map_cluster_to_persona(cluster_stats)

    personas = assign_persona_to_users(labels, persona_map)

    result = dict(zip(user_ids, personas))

    return result