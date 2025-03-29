import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "pong_game"
        # Ajouter cette connexion au groupe dédié au jeu
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Retirer cette connexion du groupe à la déconnexion
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Vous pouvez traiter ici les mises à jour du jeu (exemple : positions, scores, etc.)
        # Puis diffuser à tous les clients connectés dans la même room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_update",
                "data": data,
            }
        )

    async def game_update(self, event):
        # Envoyer le message à la connexion WebSocket
        await self.send(text_data=json.dumps(event["data"]))
