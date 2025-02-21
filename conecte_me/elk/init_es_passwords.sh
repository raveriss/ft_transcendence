#!/bin/sh
set -e

# Optionnel : attente initiale pour laisser le temps à Elasticsearch de démarrer
echo "Attente initiale de 30 secondes pour Elasticsearch..."
sleep 30

echo "Attente que Elasticsearch soit prêt..."
until curl -s -u elastic:"${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_cluster/health?pretty" | grep -q '"status"'; do
  echo "Elasticsearch n'est pas encore prêt, on attend 5 secondes..."
  sleep 5
done

echo "Elasticsearch est prêt. Création du rôle logstash_writer..."

# Création du rôle logstash_writer pour donner les privilèges sur les indices logs-*
curl -s -X PUT "${ELASTICSEARCH_URL}/_security/role/logstash_writer?pretty" \
  -H "Content-Type: application/json" \
  -u elastic:"${ELASTIC_PASSWORD}" \
  -d'
{
  "cluster": ["manage_index_templates","monitor"],
  "indices": [
    {
      "names": [ "*" ],
      "privileges": ["all"]
    }
  ]
}
'

echo "Rôle logstash_writer créé."

echo "Création (ou mise à jour) de l'utilisateur logstash_writer..."

# Création (ou mise à jour) de l'utilisateur logstash_writer avec le rôle logstash_writer
curl -s -X PUT "${ELASTICSEARCH_URL}/_security/user/logstash_writer?pretty" \
  -H "Content-Type: application/json" \
  -u elastic:"${ELASTIC_PASSWORD}" \
  -d'
{
  "password" : "'"${ELASTICSEARCH_LOGSTASH_PASSWORD}"'",
  "roles" : [ "logstash_writer" ],
  "full_name" : "Logstash Writer",
  "email" : "logstash_writer@example.com"
}
'

echo "L'utilisateur logstash_writer a été créé avec succès."

echo "Elasticsearch est prêt. Mise à jour des mots de passe..."

# Met à jour le mot de passe pour kibana_system
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/kibana_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_KIBANA_PASSWORD}\"}"

# Met à jour le mot de passe pour logstash_system
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/logstash_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_LOGSTASH_PASSWORD}\"}"

# Met à jour le mot de passe pour beats_system
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/beats_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_BEATS_PASSWORD}\"}"

# Met à jour le mot de passe pour apm_system
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/apm_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_APM_PASSWORD}\"}"

# Met à jour le mot de passe pour remote_monitoring_user
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/remote_monitoring_user/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_REMOTE_MONITORING_PASSWORD}\"}"

echo "Les mots de passe ont été mis à jour."
