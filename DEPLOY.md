# Build và đẩy BloomNote lên homelap

Site công khai: https://bloom.nexusbase.io.vn

## 1. Máy dev — đẩy code lên GitHub

Trong thư mục `bloom-note`:

```bash
git add -A
git status
git commit -m "Mô tả thay đổi"
git push origin main
```

Chỉ cần `git push` nếu commit đã có sẵn. Homelap lấy code từ `https://github.com/anhtuan020699/bloom-note.git`.

## 2. Homelap — lần đầu

Đã có Docker, mạng `apps_shared`, Postgres `shared-postgres`, và Cloudflare Tunnel. Cổng web là `5173`.

```bash
cd ~/apps/projects
git clone https://github.com/anhtuan020699/bloom-note.git
cd bloom-note

docker exec shared-postgres psql -U postgres -c "CREATE USER bloomnote WITH PASSWORD 'U2Pw4XLdT9zfpvqVgYDimIWK';"
docker exec shared-postgres psql -U postgres -c "CREATE DATABASE bloomnote OWNER bloomnote;"
docker exec shared-postgres psql -U postgres -d bloomnote -c "GRANT ALL ON SCHEMA public TO bloomnote;"

docker compose up -d --build
docker compose exec api npm run seed
```

Seed chỉ chạy **một lần**. Tài khoản admin: `admin` / `admin`. Đăng nhập xong thì đổi mật khẩu.

Cloudflare Tunnel, public hostname `bloom.nexusbase.io.vn`, Service URL:

```
http://localhost:5173
```

## 3. Homelap — lần sau (sau khi push)

```bash
cd ~/apps/projects/bloom-note
git pull
docker compose up -d --build
```

Không chạy seed lại. Ảnh và nhạc upload nằm trong volume `uploads`, database nằm trong `shared-postgres`.

## 4. Kiểm tra

```bash
docker ps --filter name=bloomnote --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker exec bloomnote-api node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>r.text()).then(console.log)"
docker exec bloomnote-web node -e "fetch('http://127.0.0.1:5173').then(r=>console.log(r.status))"
ss -tln | grep 5173
```

API phải in JSON (`ok: true`). Web phải in `200`. Cổng `5173` phải `LISTEN`.

Rồi mở https://bloom.nexusbase.io.vn

## 5. Máy dev — chạy local (không bắt buộc)

Postgres local: container `bloomnote-pg` cổng `5434`.

```bash
docker start bloomnote-pg
```

`server/.env` trỏ `127.0.0.1:5434`, không trỏ homelab.

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Web: http://localhost:5173  
API: http://localhost:4000

## Lỗi hay gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Build web thiếu `lightningcss.linux-x64-gnu.node` | Dockerfile client đã cài gói Linux. `git pull` rồi build lại. |
| Build API thiếu `./uploads/uploads.module` | File nằm trong `server/src/uploads`. `git pull` rồi build lại. |
| Cổng 80/443 đã bị Nginx chiếm | Không dùng Caddy. Tunnel trỏ thẳng `http://localhost:5173`. |
| Tên miền trắng / 502 | `ss -tln \| grep 5173` và Cloudflare Service URL phải là `http://localhost:5173`. |
| Dán lệnh bị `>` | Thiếu dấu `"` cuối. `Ctrl+C` rồi dán lại một lệnh đủ. |
