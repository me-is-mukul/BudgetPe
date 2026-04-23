import numpy as np

def get_cluster_stats(feature_vectors, labels):
    """
    Returns average feature values per cluster
    """
    clusters = {}

    for i, label in enumerate(labels):
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(feature_vectors[i])

    cluster_stats = {}

    for label, vectors in clusters.items():
        cluster_stats[label] = np.mean(vectors, axis=0)

    return cluster_stats

def map_cluster_to_persona(cluster_stats):
    """
    Input:
        cluster_stats[label] = [
            food_ratio,
            travel_ratio,
            shopping_ratio,
            avg_amount,
            txn_freq,
            night_ratio,
            weekend_ratio,
            variance
        ]

    Output:
        {cluster_label: persona_name}
    """

    persona_map = {}

    for label, features in cluster_stats.items():
        (
            food_ratio,
            travel_ratio,
            shopping_ratio,
            avg_amount,
            txn_freq,
            night_ratio,
            weekend_ratio,
            variance
        ) = features


        if food_ratio > 0.5 and night_ratio > 0.5:
            persona = "Impulse Eater"

        elif shopping_ratio > 0.5 and avg_amount > 800:
            persona = "Big Spender"

        elif travel_ratio > 0.5:
            persona = "Daily Commuter"

        elif weekend_ratio > 0.5:
            persona = "Weekend Spender"

        elif variance > 500:
            persona = "Irregular Spender"

        else:
            persona = "Balanced User"

        persona_map[label] = persona

    return persona_map

def assign_persona_to_users(labels, persona_map):
    """
    Output:
        list of personas aligned with input users
    """
    return [persona_map[label] for label in labels]