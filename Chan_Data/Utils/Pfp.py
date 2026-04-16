import requests

API_URL="https://api.waifu.im/images?orderBy=Random&isNsfw=False&orientation=Portrait&isAnimated=False&includedTags=waifu&excludedTags=ecchi"

def get_pfp_path():
    response = requests.get(API_URL)
    imgurl = response.json()['items'][0]['url']
    return imgurl