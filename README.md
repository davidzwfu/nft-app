# nft-app

NFT scanning tool to calculate rarity scores for a given project. 

Rarity Score = 1 ÷ (# of Items With That Trait Value / Total # of Items in Collection)

Utilizes websockets to simulate multithreading when polling for traits (to bypass throttling). This is done by either opening multiple tabs or by using multiple Heroku dynos.
