# tournament/forms.py

from django import forms

class TournamentForm(forms.Form):
    name = forms.CharField(max_length=255)
    num_players = forms.IntegerField(min_value=2)
    player_nicknames = forms.CharField(widget=forms.Textarea)

