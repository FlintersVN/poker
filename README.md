![Build Status](https://flintersvn.github.io/poker/badges/main/pipeline.svg)

---

The project was deployed to [https://flintersvn.github.io/poker/](https://flintersvn.github.io/poker/)

---

## Technologies

- TailwindCSS 3 (https://tailwindcss.com/)
- VueJS 3 (https://vuejs.org)
- Bundle parcel (https://parceljs.org)
- Websocket via Pusher (https://pusher.com)
- Pusher Auth channels deployed on Heroku (https://github.com/pusher/pusher-channels-auth-example)

> This project was created with minimum tech stack. The early version, It's only contains HTML with a script
link to Vue & TailwindCSS on CDN. No bundle, no node_modules, no Single File Components (SFC)


## Development

```
node --version
# v17.2.0
npm --version
# 8.1.4
npm install
npm run start

# To build code & deploy
npm run build
```