# BestFriendsBot

This is a bot that [I](https://github.com/Mineturtlee) and T.H. made, called Best Friends Bot.
Bot is mainly Vietnamese, but commands are in English.

# Usage

1. Create a bot [here](https://discord.dev) and copy the token as well as the application ID.
2. Make a database at MongoDB Atlas or host a MongoDB database (do it yourself on this one)
3. Finish config.json following [this section](#config.json)

# config.json

| Name | Type | Description |
| ---- | ---- | ----- |
| token | String | Discord token that you got [above](#cách-sử-dụng) |
| app_id | String | The ID you got with the token |
| dev_server | String | The development server ID (if possible) |
| db_uri | String | URL of the MongoDB server under the format `mongodb+srv://name:password@the_rest_of_the_url` or localhost (required) |
| curse_file | String | Path to file saved locally, to spam curses (if you added a channel?) |
| cron_nhay | String | Cron to spam, keep blank to not spam. |

# Credits

I'd like to tahnksat (pun intended, join https://discord.gg/adofai):

- T.H for giving me the ideas
- me for making the bot lolz