# Chai aur backend

An Express API for accounts on a video site. MongoDB is connected in `src/db/index.js`, and the database name appended to `MONGODB_URI` is `videotube`, from `src/constants.js`. The app is created in `src/app.js` and starts listening in `src/index.js` only after that connection succeeds.

Users live in `src/models/user.model.js`. A password is hashed with bcrypt before save. `src/models/video.model.js` and `src/models/subscription.model.js` define videos and subscriptions. No route in this repo creates either one. Channel and watch-history reads look at those collections, so they stay empty until something else writes them.

Every route is under `/api/v1/users`.

`POST /register` expects `fullName`, `email`, `username`, and `password`, plus an `avatar` file. `coverImage` is optional. Multer writes the files to `public/temp`, `src/utils/cloudinary.js` uploads them, and the temp file is deleted. The avatar is required. The response drops `password` and `refreshToken`.

`POST /login` accepts a username or an email, plus a password. It sets `accessToken` and `refreshToken` as httpOnly cookies with `secure: true`, and returns both tokens in the JSON body. On plain http the browser drops those cookies. The access token’s username claim is `this.userSchema`, which is empty.

`POST /refresh-token` takes the refresh token from the cookie or the body, checks it against the one stored on the user, and issues a new pair.

These routes need a logged-in user. The middleware reads the `accessToken` cookie, or a header spelled `Authorozation`.

- `POST /logout` clears the stored refresh token and both cookies.
- `POST /change-password` checks `oldPassword` and saves `newPassword`.
- `GET /current-user` returns the user from the token.
- `PATCH /update-account` sets `fullName` and `email`.
- `PATCH /avatar` and `PATCH /cover-image` replace that image. The previous Cloudinary file is left in place.
- `GET /c/:username` returns that user’s name, images, subscriber count, and how many channels they subscribe to.
- `GET /history` looks up `watchHistory` and each video’s owner. The handler calls `mongoose.Types.ObjectId` without importing `mongoose`, so the request throws.

Errors use `ApiError`. Success bodies use `ApiResponse`.

## Run

Create `.env` in the repo root. Cloudinary’s secret is read as `CLOUDINARY_APT_SECRET`.

```
PORT=8000
MONGODB_URI=...
CORS_ORIGIN=...

ACCESS_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_APT_SECRET=...
```

```bash
npm install
npm run dev
```

`dev` starts nodemon on `src/index.js`. The process listens on `PORT`, or 8000 if that is unset. Register is http://localhost:8000/api/v1/users/register.
