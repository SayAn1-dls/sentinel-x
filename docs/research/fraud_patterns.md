# Fraud Pattern Analysis

## Common Fraud Topologies

### Star Pattern
One central node transacts with many peripheral nodes in rapid succession.
Indicator: high out-degree, short time delta between transactions.

### Chain Layering
Funds move through A → B → C → D to obscure origin.
Indicator: linear path in graph, amounts decrease by ~10-15% at each hop.

### Fan-out / Fan-in
Funds split across many nodes then reconsolidate.
Indicator: high betweenness centrality at source and sink nodes.

### Cyclic Washing
Funds loop back to origin after several hops.
Indicator: cycles detected in directed transaction graph.

## Detection Strategy
- Run cycle detection (DFS) every 60s
- Flag nodes with degree centrality > 0.85
- Alert on chain length > 4 within 1 hour window
