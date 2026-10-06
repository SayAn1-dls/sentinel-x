def calculate_centrality(adjacency):
    total = len(adjacency)
    if total <= 1:
        return {n: 0.0 for n in adjacency}
    return {node: len(nbrs) / (total - 1) for node, nbrs in adjacency.items()}

def density(num_nodes, num_edges):
    if num_nodes < 2:
        return 0.0
    return (2 * num_edges) / (num_nodes * (num_nodes - 1))

def find_high_risk_nodes(risk_scores, threshold=0.75):
    return [n for n, s in risk_scores.items() if s >= threshold]
