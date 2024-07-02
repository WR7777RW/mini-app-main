# DegenDeals inside Telegram

### .env

| var_name      | value                     |
| ------------- | ------------------------- |
| WC_PROJECT_ID | wallet_connect_project_id |
| DEDEALS721    | 721_token_address         |
| DEDEALS20     | 20_token_address          |
| IMGUR         | imgur_client_id           |

## Usage

Add domen `127.0.0.1 tg-mini-app.local` to hosts

```
sudo nano /etc/hosts
```

then

```bash

mkdir -p .cert && mkcert -key-file ./.cert/localhost-key.pem -cert-file ./.cert/localhost.pem 'tg-mini-app.local'

```

```bash
# npm
npm install
npm run dev
```

```bash
# yarn
yarn
yarn dev
```

# Links

- [Doc](https://docs.ton.org/develop/dapps/twa)
- [Example TMA](https://t.me/vite_twa_example_bot/app)
- [Link](https://twa-dev.github.io/vite-boilerplate/)
