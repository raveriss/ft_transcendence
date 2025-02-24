#!/bin/sh
set -e

# --- Attendre que Elasticsearch soit prêt ---
echo "Attente initiale de 30 secondes pour Elasticsearch..."
sleep 30

echo "Attente que Elasticsearch soit prêt..."
until [ "$(curl -o /dev/null -s -w '%{http_code}' -u elastic:"${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_cluster/health")" = "200" ]; do
  echo "Elasticsearch n'est pas encore prêt, on attend 5 secondes..."
  sleep 5
done
echo "Elasticsearch est prêt."

# --- Mise à jour des mots de passe des utilisateurs internes ---
echo "Mise à jour du mot de passe pour kibana_system..."
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/kibana_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_KIBANA_PASSWORD}\"}"

echo "Mise à jour du mot de passe pour logstash_system..."
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/logstash_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_LOGSTASH_PASSWORD}\"}"

echo "Mise à jour du mot de passe pour beats_system..."
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/beats_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_BEATS_PASSWORD}\"}"

echo "Mise à jour du mot de passe pour apm_system..."
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/apm_system/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_APM_PASSWORD}\"}"

echo "Mise à jour du mot de passe pour remote_monitoring_user..."
curl -s -X POST "${ELASTICSEARCH_URL}/_security/user/remote_monitoring_user/_password?pretty" \
     -H "Content-Type: application/json" \
     -u elastic:"${ELASTIC_PASSWORD}" \
     -d "{\"password\": \"${ELASTICSEARCH_REMOTE_MONITORING_PASSWORD}\"}"

# --- Création ou mise à jour du rôle et de l'utilisateur logstash_writer ---
echo "Création du rôle logstash_writer..."
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
echo "Utilisateur logstash_writer créé."
# --- politique qui passe par une phase « hot » et une phase « delete » ---
echo "Création de la politique ILM 'logs_policy'..."
curl -X PUT "${ELASTICSEARCH_URL}/_ilm/policy/logs_policy?pretty" \
     -H 'Content-Type: application/json' \
     -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
     -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {}
      },
      "delete": {
        "min_age": "15d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
'
echo "Politique ILM 'logs_policy' créée."
echo "Création du template d'indice 'logs_template'..."
curl -X PUT "${ELASTICSEARCH_URL}/_template/logs_template?pretty" \
     -H 'Content-Type: application/json' \
     -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
     -d'
{
  "index_patterns": ["logs-*"],
  "settings": {
    "number_of_shards": 1,
    "index.lifecycle.name": "logs_policy"
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "message": { "type": "text" },
      "loglevel": { "type": "keyword" }
    }
  }
}
'
echo "Template 'logs_template' créé."



# --- Attendre que Kibana soit prêt et importer les objets sauvegardés ---
echo "Attente de 30 secondes pour que Kibana soit prêt..."
sleep 30

# echo "Création de l'index pattern logs-*..."
# curl -X POST "http://kibana:5601/api/saved_objects/index-pattern?overwrite=true" \
#   -H "kbn-xsrf: true" \
#   -H "Content-Type: application/json" \
#   -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
#   -d'
# {
#   "attributes": {
#     "title": "logs-*",
#     "timeFieldName": "@timestamp"
#   }
# }
# '
# echo "Index pattern créé."

echo "Importation des objets sauvegardés dans Kibana..."
curl -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/elk/saved_objects.ndjson" \
  -u ${ELASTIC_USER}:${ELASTIC_PASSWORD}

echo "Importation terminée."
