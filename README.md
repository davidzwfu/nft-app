# nft-app

NFT scanning tool to calculate rarity scores for a given project. Rarity Score is calculated by taking sum of all trait rarity scores.

Utilizes websockets to simulate multithreading when polling for traits (to bypass throttling). This is done by either opening multiple tabs or by using multiple Heroku dynos.

![image](https://user-images.githubusercontent.com/69821833/199500536-b63a06d5-c957-458b-a253-4c57c5bd0b2b.png)

![image](https://user-images.githubusercontent.com/69821833/199500649-6ce55d0d-ae1d-4c63-a9d5-bea0aa24ce78.png)
