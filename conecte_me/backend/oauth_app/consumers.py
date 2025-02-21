# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async

# class GameConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # This is where you can manage the connection, accept it or reject based on conditions
#         self.room_name = 'pong_game_room'  # You can make this dynamic for each game session
#         self.room_group_name = f"game_{self.room_name}"

#         # Join the game room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave the game room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     # Receive message from WebSocket (from frontend)
#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         action = data['action']

#         if action == 'start_game':
#             await self.start_game(data)
#         elif action == 'move_paddle':
#             await self.move_paddle(data)
#         elif action == 'update_score':
#             await self.update_score(data)

#     # Function to start the game
#     async def start_game(self, data):
#         # Logic for starting the game
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_started',
#                 'message': 'Game started!'
#             }
#         )

#     # Function to move the paddle
#     async def move_paddle(self, data):
#         # Logic to move paddle (position update)
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'paddle_moved',
#                 'player': data['player'],
#                 'position': data['position']
#             }
#         )

#     # Function to update score
#     async def update_score(self, data):
#         # Logic to update score
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'score_updated',
#                 'left_score': data['left_score'],
#                 'right_score': data['right_score']
#             }
#         )

#     # Receive message from the group (for broadcasting)
#     async def game_started(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'game_started',
#             'message': event['message']
#         }))

#     async def paddle_moved(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'paddle_moved',
#             'player': event['player'],
#             'position': event['position']
#         }))

#     async def score_updated(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'score_updated',
#             'left_score': event['left_score'],
#             'right_score': event['right_score']
#         }))
