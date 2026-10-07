#!/bin/bash
echo "Testing API endpoints..."

curl http://localhost:5000/api/dashboard
curl http://localhost:5000/api/experiments
curl -X POST http://localhost:5000/api/ai/qa \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain photosynthesis","level":"Beginner"}'

curl "http://localhost:5000/api/news?topic=climate+change"