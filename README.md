# Backend NestJS
--- thích cài thủ công 
## 📦 Yêu cầu môi trường

- "node": "22.13.1",
- "npm": "10.9.2"

nếu chưa có package.json-lock thì npm install rồi hãy npm ci
npm ci

## 🚀 Hướng dẫn cài đặt

--- cài nvmrc 
nvm use

npm ci

npm run start:dev

--- cài thư viện mới 
npm install axios --save-exact

--- ví dụ tránh gây conflict
npm info @nestjs-modules/mailer

--- hiện thị 
peerDependencies:
  @nestjs/common: "^11.0.0 || ^12.0.0"

--- rồi cài chuẩn 
npm install @nestjs-modules/mailer@2.0.2 --save-exact

--- nhớ là mỗi khi cài gì đó mới thì --save-exact ở sau cầu mỗi câu lệnh cài 
ví dụ : npm install @nestjs/jwt passport-jwt passport @nestjs/passport --save-exact

---
nvm use
