# Database Schema

## Collections (sentinel_x DB)

### users
```json
{
  "_id": "ObjectId",
  "email": "string",
  "name": "string",
  "picture": "string",
  "role": "admin | analyst | viewer",
  "createdAt": "Date"
}
```

### sessions
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "token": "string",
  "expiresAt": "Date",
  "ip": "string",
  "userAgent": "string"
}
```

### audit_logs
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "action": "string",
  "resource": "string",
  "timestamp": "Date",
  "severity": "low | medium | high | critical"
}
```

### alerts
```json
{
  "_id": "ObjectId",
  "type": "string",
  "riskScore": "number",
  "status": "open | resolved",
  "detectedAt": "Date"
}
```
