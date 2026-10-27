# GNN Architecture Notes

## Graph Neural Network for Fraud Detection

### Node Features
- Transaction amount (normalized)
- Timestamp delta
- Node degree (in/out)
- Historical fraud score
- Account age

### Edge Features
- Transfer amount
- Transfer frequency
- Shared IP flag
- Device fingerprint match

### Model: GraphSAGE
- 3 aggregation layers
- Mean aggregator
- ReLU activation
- Dropout: 0.3
- Hidden dim: 256

### Loss Function
Weighted binary cross-entropy (fraud class weight: 10x)

### Evaluation
- AUC-ROC: 0.994
- Precision@K: 0.97
- Recall: 0.98
