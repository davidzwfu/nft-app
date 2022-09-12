# nft-app

NFT scanning tool to calculate rarity scores for a given project. Rarity Score is calculated by taking sum of all trait rarity scores.

Utilizes websockets to simulate multithreading when polling for traits (to bypass throttling). This is done by either opening multiple tabs or by using multiple Heroku dynos.
