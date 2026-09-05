# DNC Trace - Hệ thống E-commerce tích hợp Blockchain

## 1. Giới thiệu dự án

**DNC Trace** là hệ thống thương mại điện tử cho sản phẩm cà phê, kết hợp mô hình bán hàng trực tuyến truyền thống với công nghệ Blockchain nhằm tăng tính minh bạch trong truy xuất nguồn gốc sản phẩm.

Trong hệ thống này, khách hàng có thể xem sản phẩm, kiểm tra hành trình sản xuất được ghi nhận trên Blockchain, thêm sản phẩm vào giỏ hàng, thanh toán, theo dõi đơn hàng và đánh giá sản phẩm sau khi nhận hàng. Quản trị viên có thể quản lý sản phẩm, cập nhật tiến độ chuỗi cung ứng, ký giao dịch qua MetaMask, quản lý đơn hàng và theo dõi thống kê kinh doanh.

### Mục tiêu

- Xây dựng một website e-commerce hoàn chỉnh với các chức năng mua hàng cơ bản.
- Ứng dụng Blockchain để lưu vết các công đoạn trong chuỗi cung ứng cà phê.
- Cho phép khách hàng kiểm chứng hành trình sản phẩm trực tiếp từ Smart Contract.
- Tăng độ tin cậy của dữ liệu nguồn gốc, hạn chế khả năng chỉnh sửa lịch sử sau khi đã ghi nhận.
- Cung cấp giao diện quản trị phục vụ quản lý sản phẩm, đơn hàng và thống kê doanh thu.

### Ý nghĩa thực tiễn

| Khía cạnh | Ý nghĩa |
| --- | --- |
| Người tiêu dùng | Có thể kiểm tra nguồn gốc và quá trình xử lý sản phẩm trước khi mua. |
| Doanh nghiệp | Tăng niềm tin thương hiệu thông qua dữ liệu minh bạch và có thể kiểm chứng. |
| Quản trị vận hành | Chuẩn hóa quy trình cập nhật sản phẩm, tồn kho, đơn hàng và đánh giá. |
| Học thuật | Minh họa cách kết hợp Client-Server, Database và Blockchain trong một hệ thống thực tế. |

## 2. Kiến trúc và Công nghệ

### Mô hình tổng thể

Dự án được tổ chức theo mô hình **monorepo gọn**, trong đó backend nằm trong `src`, còn frontend React/Vite được đưa ra cấp root qua thư mục `client` để project giống cấu trúc `Start` hơn và không cần thư mục `frontend` riêng.

```text
blockchain-ecommerce/
+-- src/
|   +-- config/              # Cấu hình backend
|   |   +-- db/              # Kết nối MySQL
|   +-- controllers/         # Business logic cho API backend
|   +-- middlewares/         # Middleware xác thực JWT và phân quyền admin
|   +-- routes/              # Định nghĩa REST API routes
|   +-- util/                # Tiện ích gửi email
|   +-- index.js             # Entry point Express server
+-- client/
|   +-- components/          # Header, Footer, ToastProvider, Pagination
|   +-- contracts/           # ABI Smart Contract
|   +-- pages/               # Các màn hình user/admin
|   +-- services/            # Axios API client
|   +-- utils/               # Web3/MetaMask helper
+-- public/                  # Static assets cho Vite
+-- index.html               # Entry HTML cho React
+-- vite.config.mjs          # Cấu hình Vite
+-- eslint.config.mjs        # Cấu hình ESLint
+-- package.json             # Dependencies/scripts backend + frontend
```

### Luồng kiến trúc Client-Server-Blockchain

```text
Người dùng/Admin
      |
      v
React + Vite Frontend
      |
      | REST API qua Axios + JWT
      v
Node.js + Express Backend
      |
      | SQL query qua mysql2/promise
      v
MySQL Database

Admin/User Frontend
      |
      | ethers.js + MetaMask
      v
Solidity Smart Contract
```

Backend chịu trách nhiệm xử lý nghiệp vụ e-commerce, xác thực, quản lý đơn hàng, địa chỉ, đánh giá và gửi email. Frontend chịu trách nhiệm hiển thị giao diện, gọi REST API và kết nối ví MetaMask để tương tác với Smart Contract.

### Tech Stack

| Thành phần | Công nghệ | Vai trò |
| --- | --- | --- |
| Frontend | React 19, Vite | Xây dựng SPA cho khách hàng và quản trị viên. |
| Routing | React Router DOM | Điều hướng các trang sản phẩm, giỏ hàng, đơn hàng, admin. |
| HTTP Client | Axios | Gọi REST API backend, tự động gắn JWT token bằng interceptor. |
| Chart | Recharts | Hiển thị dashboard doanh thu và tỷ lệ trạng thái đơn hàng. |
| Blockchain Client | ethers.js v6 | Kết nối MetaMask, gọi hàm Smart Contract. |
| Backend | Node.js, Express 5 | Xây dựng REST API. |
| Database | MySQL, mysql2/promise | Lưu dữ liệu người dùng, sản phẩm, giỏ hàng, đơn hàng, đánh giá. |
| Authentication | JWT, bcryptjs | Đăng nhập, mã hóa mật khẩu, phân quyền user/admin. |
| Email | Nodemailer | Gửi email xác nhận đơn hàng. |
| Blockchain | Solidity Smart Contract, MetaMask, Ganache, Remix IDE | Ghi và đọc lịch sử chuỗi cung ứng trên local blockchain/dev network. |

### API Backend chính

| Nhóm API | Prefix | Chức năng |
| --- | --- | --- |
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy/cập nhật hồ sơ cá nhân. |
| Products | `/api/products` | Danh sách, chi tiết, thêm/sửa/xóa/kích hoạt sản phẩm. |
| Cart | `/api/cart` | Thêm giỏ hàng, xem giỏ hàng, cập nhật số lượng, lịch sử đơn hàng user. |
| Orders | `/api/orders` | Checkout mới, xác nhận đã nhận hàng, quản lý đơn hàng admin, dashboard. |
| Addresses | `/api/addresses` | CRUD địa chỉ giao hàng, đặt địa chỉ mặc định. |
| Reviews | `/api/reviews` | Thêm và xem đánh giá sản phẩm. |
| Supply Chain | `/api/supply-chain` | Lưu công đoạn chuỗi cung ứng, tạo hash, lưu transaction hash, xem lịch sử off-chain. |

## 3. Phân tích Thiết kế Hệ thống

### Thiết kế Database

Dự án hiện có file dump database `dnc_trace.sql`, bao gồm cấu trúc bảng, khóa chính, một số khóa ngoại, chỉ mục và dữ liệu mẫu để khởi tạo hệ thống. Bảng dưới đây tổng hợp lại các thực thể chính từ file SQL và từ các câu lệnh truy vấn trong backend.

| Table | Cột chính được sử dụng | Mục đích |
| --- | --- | --- |
| `users` | `id`, `email`, `password`, `full_name`, `phone`, `avatar`, `role`, `provider`, `created_at` | Lưu tài khoản người dùng/admin, thông tin cá nhân và phương thức đăng nhập. |
| `products` | `id`, `name`, `price`, `image`, `description`, `origin`, `stock`, `status`, `created_at` | Lưu hồ sơ sản phẩm, giá, ảnh, nguồn gốc, tồn kho và trạng thái mở bán. |
| `cart` | `id`, `user_id`, `product_id`, `quantity` | Lưu giỏ hàng theo từng người dùng. |
| `orders` | `id`, `user_id`, `full_name`, `phone`, `address`, `total_price`, `payment_method`, `status`, `created_at` | Lưu đơn hàng tổng. |
| `order_details` | `id`, `order_id`, `product_id`, `quantity`, `price` | Lưu từng sản phẩm trong đơn hàng, chốt giá tại thời điểm mua. |
| `user_addresses` | `id`, `user_id`, `full_name`, `phone`, `address_line`, `city`, `district`, `is_default` | Lưu nhiều địa chỉ giao hàng cho mỗi người dùng. |
| `reviews` | `id`, `product_id`, `user_id`, `rating`, `comment`, `created_at` | Lưu đánh giá sản phẩm sau khi khách đã nhận hàng. |
| `supply_chain` | `id`, `product_id`, `stage`, `data`, `created_at` | Lưu lịch sử chuỗi cung ứng ở database backend. |
| `blockchain_records` | `id`, `product_id`, `hash`, `tx_hash` | Lưu bằng chứng hash và transaction hash sau khi ghi Blockchain. |

### Quan hệ dữ liệu cơ bản

| Quan hệ | Diễn giải |
| --- | --- |
| `users` 1-n `cart` | Một người dùng có nhiều dòng sản phẩm trong giỏ hàng. |
| `users` 1-n `orders` | Một người dùng có nhiều đơn hàng. |
| `users` 1-n `user_addresses` | Một người dùng có nhiều địa chỉ giao hàng. |
| `orders` 1-n `order_details` | Một đơn hàng gồm nhiều sản phẩm. |
| `products` 1-n `order_details` | Một sản phẩm có thể xuất hiện trong nhiều đơn hàng. |
| `products` 1-n `reviews` | Một sản phẩm có nhiều đánh giá. |
| `users` 1-n `reviews` | Một người dùng có thể đánh giá nhiều sản phẩm đã mua. |
| `products` 1-n `supply_chain` | Một sản phẩm có nhiều công đoạn chuỗi cung ứng. |
| `products` 1-n `blockchain_records` | Một sản phẩm có thể có nhiều bằng chứng Blockchain. |

### Trạng thái đơn hàng

| Status | Ý nghĩa | Người thao tác |
| --- | --- | --- |
| `pending` | Đơn hàng mới, chờ xử lý. | Hệ thống tạo khi checkout. |
| `processing` | Đang chuẩn bị/đóng gói. | Admin cập nhật. |
| `shipped` | Đang giao hàng. | Admin cập nhật. |
| `delivered` | Đã giao/khách xác nhận nhận hàng. | User xác nhận hoặc admin cập nhật. |
| `cancelled` | Đơn hàng bị hủy. | Admin cập nhật. |

### Luồng đặt hàng

1. Khách hàng đăng nhập bằng email/mật khẩu.
2. Frontend lưu JWT token vào `localStorage`.
3. Khách hàng xem danh sách sản phẩm đã kích hoạt (`status = 1`).
4. Khách hàng thêm sản phẩm vào giỏ hàng qua `/api/cart/add`.
5. Khách hàng vào trang checkout, chọn địa chỉ giao hàng và phương thức thanh toán.
6. Frontend gọi `/api/orders/checkout`.
7. Backend kiểm tra địa chỉ thuộc về user, đọc giỏ hàng, tính lại tổng tiền từ database.
8. Backend tạo bản ghi `orders` với trạng thái `pending`.
9. Backend tạo các dòng `order_details` và trừ tồn kho sản phẩm.
10. Backend xóa giỏ hàng của user.
11. Backend gửi email xác nhận đơn hàng bằng Nodemailer.
12. Khách hàng theo dõi đơn hàng tại trang lịch sử đơn hàng.

### Luồng xác nhận nhận hàng và đánh giá

1. Admin cập nhật trạng thái đơn hàng sang `shipped`.
2. Khách hàng thấy nút xác nhận đã nhận hàng trong trang `/orders`.
3. Khách hàng gọi API `/api/orders/user/confirm-received/:id`.
4. Backend chỉ cho xác nhận nếu đơn thuộc user hiện tại và đang ở trạng thái `shipped`.
5. Đơn hàng được chuyển sang `delivered`.
6. Khi đơn đã `delivered`, khách hàng có thể đánh giá sản phẩm trong đơn.
7. Backend kiểm tra user đã mua và đã nhận sản phẩm trước khi cho ghi vào bảng `reviews`.

### Luồng truy xuất nguồn gốc Blockchain

1. Admin tạo hồ sơ sản phẩm trong trang quản lý sản phẩm.
2. Admin vào trang quản trị chuỗi cung ứng `/admin`.
3. Admin chọn sản phẩm và nhập dữ liệu theo từng bước tiêu chuẩn:
   - Thu hoạch & Phân loại
   - Sơ chế & Lên men
   - Phơi khô & Lưu kho
   - Rang xay & Phối trộn
   - Kiểm định chất lượng
   - Đóng gói & Xuất xưởng
4. Frontend kết nối MetaMask qua `ethers.BrowserProvider`.
5. Frontend gọi Smart Contract `addStage(productId, stageName, note, updatedBy)`.
6. Sau khi giao dịch được xác nhận, frontend làm mới lịch sử từ `getHistory(productId)`.
7. Ở bước cuối, hệ thống gọi `/api/products/activate/:id` để cập nhật `status = 1` và nhập tồn kho.
8. Khách hàng xem chi tiết sản phẩm và đọc lịch sử từ Smart Contract bằng `getHistory`.

### Smart Contract

Workspace hiện tại không chứa file Solidity `.sol`, nhưng frontend có ABI tại `client/contracts/DNCTraceABI.json`. Từ ABI có thể xác định Smart Contract hỗ trợ:

| Hàm/Event | Kiểu | Vai trò |
| --- | --- | --- |
| `addStage(uint256,string,string,string)` | Write | Ghi một công đoạn mới cho sản phẩm. |
| `getHistory(uint256)` | Read | Trả về danh sách công đoạn của sản phẩm. |
| `getStageCount(uint256)` | Read | Trả về số lượng công đoạn đã ghi. |
| `admin()` | Read | Địa chỉ admin của contract. |
| `StageAdded` | Event | Sự kiện phát ra khi thêm công đoạn. |

## 4. Các chức năng chính

### Khách hàng

| Chức năng | Mô tả |
| --- | --- |
| Đăng ký | Tạo tài khoản mới với email, mật khẩu, họ tên và số điện thoại. Role luôn mặc định là `user` để tránh leo thang đặc quyền từ frontend. |
| Đăng nhập | Xác thực bằng email/mật khẩu, nhận JWT token có thời hạn 7 ngày. |
| Xem sản phẩm | Xem danh sách sản phẩm đã kích hoạt, lọc theo tồn kho, tìm kiếm theo tên/nguồn gốc, sắp xếp theo giá/tồn kho và phân trang danh sách sản phẩm. |
| Xem chi tiết sản phẩm | Xem thông tin sản phẩm, tồn kho, danh sách đánh giá có phân trang và lịch sử Blockchain. |
| Thêm giỏ hàng | Thêm sản phẩm vào giỏ; nếu sản phẩm đã có thì tăng số lượng. |
| Quản lý giỏ hàng | Xem sản phẩm trong giỏ, cập nhật số lượng, xóa sản phẩm. |
| Quản lý hồ sơ | Cập nhật email, họ tên, số điện thoại, avatar. |
| Quản lý địa chỉ | Thêm/sửa/xóa địa chỉ giao hàng, đặt địa chỉ mặc định và phân trang danh sách địa chỉ khi có nhiều bản ghi. |
| Thanh toán | Hỗ trợ COD và VietQR. Với VietQR, frontend tạo QR bằng URL `img.vietqr.io`. |
| Lịch sử đơn hàng | Xem danh sách đơn có phân trang, chi tiết sản phẩm trong đơn, trạng thái xử lý. |
| Xác nhận nhận hàng | Chỉ xác nhận được khi đơn đang ở trạng thái `shipped`. |
| Đánh giá sản phẩm | Chỉ được đánh giá sản phẩm đã mua và đơn đã `delivered`. |

### Quản trị viên

| Chức năng | Mô tả |
| --- | --- |
| Quản lý sản phẩm | Tạo hồ sơ sản phẩm, cập nhật thông tin, xóa sản phẩm, xem trạng thái nháp/lên sàn và phân trang bảng sản phẩm. |
| Quản trị chuỗi cung ứng | Ghi từng công đoạn sản xuất lên Blockchain thông qua MetaMask. |
| Kích hoạt sản phẩm | Khi hoàn tất bước đóng gói/xuất xưởng, sản phẩm được cập nhật `status = 1` và nhập tồn kho. |
| Quản lý đơn hàng | Xem tất cả đơn hàng theo phân trang, xem chi tiết đơn, cập nhật trạng thái `pending`, `processing`, `shipped`, `delivered`, `cancelled`. |
| Dashboard thống kê | Xem tổng doanh thu, tổng số đơn, doanh thu 6 tháng gần nhất và tỷ lệ trạng thái đơn hàng bằng Recharts. |
| Phân quyền API | Các API quan trọng như tạo/sửa/xóa sản phẩm và ghi chuỗi cung ứng dùng middleware `verifyAdmin`. |

## 5. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu môi trường

| Công cụ | Mục đích |
| --- | --- |
| Node.js | Chạy backend Express và frontend Vite. |
| npm | Cài dependencies và chạy script. |
| MySQL | Lưu dữ liệu nghiệp vụ. |
| Ganache | Tạo mạng Blockchain local để demo, test giao dịch và lấy tài khoản ví thử nghiệm. |
| Remix IDE | Biên dịch và deploy Smart Contract Solidity lên Ganache hoặc mạng test. |
| MetaMask | Ký giao dịch Blockchain từ frontend. |
| Trình duyệt hiện đại | Chạy React app và extension MetaMask. |
| Gmail App Password | Gửi email xác nhận đơn hàng qua Nodemailer. |

### Cấu hình Backend

Tạo file `.env` ở thư mục gốc dự án. Có thể tham khảo `.env.example`.

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dnc_trace

JWT_SECRET=change-me

CONTRACT_ADDRESS=
```

Ý nghĩa các biến:

| Biến | Mô tả |
| --- | --- |
| `PORT` | Port chạy backend, mặc định `5000`. |
| `CORS_ORIGIN` | Origin frontend được phép gọi API. Có thể cấu hình nhiều origin bằng dấu phẩy. |
| `DB_HOST` | Host MySQL. |
| `DB_USER` | Username MySQL. |
| `DB_PASSWORD` | Password MySQL. |
| `DB_NAME` | Tên database, hiện đang dùng `dnc_trace`. |
| `JWT_SECRET` | Khóa ký JWT. Cần đổi sang chuỗi mạnh khi triển khai thật. |
| `CONTRACT_ADDRESS` | Địa chỉ Smart Contract nếu backend cần sử dụng. |

> Lưu ý bảo mật: cấu hình gửi email đã được đưa sang biến môi trường `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`. Không nên commit Gmail/App Password thật vào mã nguồn.

### Cấu hình Frontend

Tạo hoặc cập nhật file `.env` ở thư mục root nếu cần override cấu hình mặc định.

```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

| Biến | Mô tả |
| --- | --- |
| `VITE_API_URL` | Base URL của backend API. |
| `VITE_CONTRACT_ADDRESS` | Địa chỉ Smart Contract để ethers.js kết nối. |

Nếu không khai báo `VITE_CONTRACT_ADDRESS`, frontend đang dùng địa chỉ mặc định trong `client/utils/web3.js`.

### Thiết lập Blockchain Local với Ganache, Remix IDE và MetaMask

Trong quá trình phát triển và demo đồ án, hệ thống có thể sử dụng **Ganache** như một mạng Blockchain local. **Remix IDE** được dùng để biên dịch/deploy Smart Contract, còn **MetaMask** được dùng để ký giao dịch từ giao diện React.

| Công cụ | Vai trò trong dự án |
| --- | --- |
| Ganache | Chạy local blockchain, cung cấp RPC Server, Chain ID và danh sách tài khoản test có ETH giả lập. |
| Remix IDE | Viết/biên dịch/deploy Smart Contract Solidity, lấy ABI và địa chỉ contract sau khi deploy. |
| MetaMask | Kết nối trình duyệt với Ganache, import tài khoản test và ký giao dịch `addStage`. |
| ethers.js | Cầu nối trong frontend để gọi `addStage`, `getHistory`, `getStageCount` từ Smart Contract. |

Quy trình thiết lập đề xuất:

1. Mở Ganache và tạo workspace local.
2. Ghi nhận thông tin RPC Server, thường có dạng `http://127.0.0.1:7545` hoặc `http://127.0.0.1:8545`.
3. Mở MetaMask, thêm network mới trỏ đến RPC Server của Ganache.
4. Import một private key từ tài khoản Ganache vào MetaMask để có ETH test.
5. Mở Remix IDE, biên dịch contract `DNCTrace`.
6. Trong Remix, chọn môi trường deploy phù hợp:
   - `Injected Provider - MetaMask` nếu deploy thông qua MetaMask.
   - Hoặc kết nối tới Ganache nếu Remix hỗ trợ provider tương ứng.
7. Deploy contract và copy địa chỉ contract sau khi deploy.
8. Cập nhật file `.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

9. Đảm bảo ABI trong `client/contracts/DNCTraceABI.json` khớp với contract vừa deploy.
10. Khởi động lại frontend để Vite đọc lại biến môi trường.

### Cài đặt Backend

```bash
npm install
npm run dev
```

Hoặc chạy chế độ production đơn giản:

```bash
npm start
```

Backend sẽ chạy tại:

```text
http://localhost:5000
```

Endpoint kiểm tra:

```text
GET http://localhost:5000/api/health
```

### Cài đặt Frontend

```bash
npm install
npm run dev:web
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

### Build Frontend

```bash
npm run build
```

### Kiểm tra chất lượng code Frontend

```bash
npm run lint
```

### Quy trình chạy đầy đủ

1. Tạo database MySQL tên `dnc_trace`.
2. Import file `dnc_trace.sql` vào MySQL/phpMyAdmin để tạo bảng, khóa, chỉ mục và dữ liệu mẫu.
3. Cấu hình `.env`.
4. Cài dependencies bằng `npm install`.
5. Chạy backend bằng `npm run dev`.
6. Cấu hình biến `VITE_*` trong `.env` nếu cần.
7. Chạy frontend bằng `npm run dev:web`.
8. Mở Ganache để chạy local blockchain.
9. Dùng Remix IDE biên dịch/deploy Smart Contract lên Ganache.
10. Cài MetaMask, import tài khoản test từ Ganache và chọn đúng network local.
11. Đảm bảo `VITE_CONTRACT_ADDRESS` trỏ đến đúng địa chỉ contract vừa deploy.

## 6. Những cải tiến và tính năng mới nhất

Trong phiên làm việc hiện tại, dự án đã bổ sung phân trang dùng chung ở frontend thông qua component `Pagination.jsx` và cập nhật tài liệu `README.md` để phản ánh tính năng này trong các màn hình danh sách.

Dựa trên mã nguồn hiện có trong workspace, các cải tiến/tính năng nổi bật gần đây của dự án gồm:

| Nhóm cải tiến | Nội dung |
| --- | --- |
| Quản lý địa chỉ giao hàng | Thêm module `user_addresses`, API CRUD địa chỉ, đặt địa chỉ mặc định và tích hợp vào trang Profile/Checkout. |
| Checkout mới | Luồng `/api/orders/checkout` lấy địa chỉ đã lưu, tính lại tổng tiền từ database, tạo đơn hàng, tạo chi tiết đơn, trừ tồn kho, xóa giỏ hàng và gửi email xác nhận. |
| Thanh toán VietQR | Frontend hỗ trợ phương thức `QR`, hiển thị mã VietQR theo tổng tiền đơn hàng. |
| Xác nhận nhận hàng | User có thể xác nhận đơn đã nhận khi trạng thái là `shipped`; backend chuyển trạng thái sang `delivered`. |
| Đánh giá sản phẩm | User chỉ được đánh giá khi đã mua sản phẩm và đơn hàng đã `delivered`; trang chi tiết hiển thị danh sách đánh giá và điểm trung bình. |
| Dashboard admin | Thêm thống kê tổng doanh thu, tổng số đơn, doanh thu 6 tháng gần nhất và biểu đồ tỷ lệ trạng thái đơn hàng bằng Recharts. |
| Quản lý đơn hàng admin | Admin xem danh sách đơn, xem chi tiết sản phẩm trong đơn và cập nhật trạng thái đơn hàng. |
| Chuỗi cung ứng Blockchain | Admin ghi từng công đoạn sản xuất lên Smart Contract qua MetaMask; sản phẩm chỉ được kích hoạt bán sau bước đóng gói/xuất xưởng. |
| Tối ưu phân quyền | Đăng ký user không nhận `role` từ frontend; các API admin sử dụng `verifyAdmin`. |
| Phân trang frontend | Thêm component dùng chung `Pagination.jsx` và áp dụng cho danh sách sản phẩm, đơn hàng user, bảng sản phẩm admin, bảng đơn hàng admin, đánh giá sản phẩm và địa chỉ giao hàng. |
| Trải nghiệm frontend | Sử dụng lazy loading route, ToastProvider, bộ lọc sản phẩm, trạng thái hết hàng, phân trang danh sách và trang hồ sơ người dùng đầy đủ hơn. |
| Cải thiện độ an toàn checkout | Luồng `/api/orders/checkout` đã được bọc trong MySQL transaction, có kiểm tra tồn kho và rollback khi phát sinh lỗi. |
| Bảo mật cấu hình email | Thông tin Gmail/App Password đã được chuyển sang biến môi trường trong `.env.example`, tránh hard-code credential trong mã nguồn. |
| Đồng bộ API sản phẩm | Trang `AdminProducts.jsx` đã gọi đúng endpoint cập nhật sản phẩm `/products/update/:id`. |
| Siết phân quyền admin | Các API admin của đơn hàng/dashboard đã chuyển từ `verifyToken` sang `verifyAdmin`; frontend bổ sung route guard cho trang admin. |
| Kiểm soát giỏ hàng | API giỏ hàng kiểm tra sản phẩm đã mở bán, số lượng hợp lệ và tồn kho trước khi thêm/cập nhật. |

## 7. Ghi chú kỹ thuật và hướng phát triển

### Điểm mạnh hiện tại

- Kiến trúc tách lớp rõ: routes, controllers, middleware, services frontend.
- REST API dễ mở rộng và dễ kiểm thử.
- Tích hợp Blockchain ở đúng điểm nghiệp vụ: dữ liệu truy xuất nguồn gốc.
- JWT giúp frontend/backend duy trì phiên đăng nhập độc lập.
- Quy trình đánh giá có kiểm tra điều kiện mua hàng thật.

### Hạn chế cần hoàn thiện

Hệ thống hiện đã đáp ứng tốt phạm vi của một đồ án tốt nghiệp: có database `dnc_trace.sql`, có backend API, frontend e-commerce, quản trị đơn hàng và tích hợp Blockchain. Các hạn chế dưới đây không làm mất tính hoàn chỉnh của phiên bản hiện tại, nhưng là những điểm nên nêu rõ trong báo cáo để thể hiện khả năng đánh giá kỹ thuật và định hướng phát triển tiếp theo.

| Nhóm hạn chế | Hiện trạng | Tác động | Mức ưu tiên | Hướng hoàn thiện |
| --- | --- | --- | --- | --- |
| Quản lý database | `dnc_trace.sql` hiện đã đủ để import và chạy demo. Tuy nhiên đây là file dump tổng hợp cả cấu trúc và dữ liệu mẫu. | Khi dự án lớn hơn, việc theo dõi thay đổi database theo từng phiên bản sẽ khó hơn. | Trung bình | Giữ `dnc_trace.sql` cho demo; về sau có thể tách `schema.sql`, `seed.sql` hoặc dùng migration. |
| Dữ liệu mẫu | SQL có dữ liệu mẫu về người dùng, địa chỉ, số điện thoại, đơn hàng. | Nếu public repo hoặc đưa vào môi trường thật, dữ liệu mẫu có thể gây nhầm lẫn hoặc lộ thông tin không cần thiết. | Trung bình | Ẩn/sửa dữ liệu cá nhân trong bản public; tạo bộ seed data giả lập sạch hơn cho báo cáo. |
| Bảo mật email | Credential gửi email đã được chuyển sang biến môi trường; cần đảm bảo file `.env` thật không được public. | Nếu cấu hình `.env` sai, hệ thống vẫn đặt hàng thành công nhưng email xác nhận sẽ bị bỏ qua. | Trung bình | Cấu hình `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` trong môi trường chạy thật và dùng App Password riêng. |
| Đồng bộ API | Trang quản lý sản phẩm chính đã dùng đúng endpoint update; vẫn nên rà soát các component cũ không còn dùng. | Có thể gây lỗi nếu component cũ được tái sử dụng trong tương lai. | Thấp | Loại bỏ file/component cũ hoặc chuẩn hóa toàn bộ endpoint theo một tài liệu API contract. |
| Smart Contract source | Frontend đã có ABI, nhưng workspace chưa có file Solidity `.sol` và script deploy. | Khó tái triển khai contract hoặc chứng minh đầy đủ phần Blockchain khi bảo vệ luận văn. | Cao | Bổ sung thư mục `contracts/`, file `DNCTrace.sol`, script deploy và tài liệu network/address. |
| Checkout atomicity | Checkout đã dùng MySQL transaction và rollback khi lỗi. | Rủi ro mất nhất quán đã giảm đáng kể, nhưng vẫn cần test tự động để bảo vệ luồng này khi refactor. | Thấp | Bổ sung integration test cho các case: giỏ trống, hết hàng, lỗi insert chi tiết đơn, đặt hàng thành công. |
| Kiểm soát tồn kho | Checkout đã kiểm tra `stock >= quantity` và update tồn kho có điều kiện. | Hạn chế bán vượt tồn trong luồng checkout hiện tại. | Thấp | Mở rộng thêm lịch sử nhập/xuất kho và kiểm soát tồn theo lô sản xuất. |
| Thanh toán VietQR | QR hiện phục vụ hiển thị thông tin chuyển khoản; người dùng tự xác nhận đã chuyển khoản. | Chưa xác minh được giao dịch ngân hàng thật. | Trung bình | Ở giai đoạn sau, tích hợp webhook/cổng thanh toán hoặc trạng thái admin xác nhận đã nhận tiền. |
| Phân quyền frontend/backend | API admin đã dùng `verifyAdmin` và frontend đã có route guard cơ bản. | Vẫn cần xử lý tốt hơn khi token hết hạn hoặc role trong localStorage bị cũ. | Thấp | Có thể bổ sung refresh dữ liệu `/auth/me` khi app khởi động và tự logout khi token không hợp lệ. |
| Logging và error handling | Lỗi chủ yếu đang xử lý trực tiếp trong từng controller. | Khi hệ thống lớn, khó truy vết lỗi và khó chuẩn hóa response. | Thấp | Thêm middleware xử lý lỗi tập trung, format response thống nhất, log theo request id. |
| Kiểm thử tự động | Chưa có test tự động cho backend/frontend. | Khi mở rộng chức năng dễ phát sinh lỗi hồi quy. | Trung bình | Bổ sung test cho auth, cart, checkout, order status, review permission và admin API. |

### Định hướng khắc phục hạn chế

| Giai đoạn | Việc nên làm | Kết quả kỳ vọng |
| --- | --- | --- |
| Ngắn hạn | Hoàn tất cấu hình `.env` thật cho email, rà soát component cũ, kiểm tra token hết hạn ở frontend. | Hệ thống an toàn và ổn định hơn mà không cần thay đổi kiến trúc lớn. |
| Trung hạn | Bổ sung test cho checkout đã có transaction, protected route frontend, middleware xử lý lỗi tập trung. | Giảm lỗi dữ liệu, tăng tính nhất quán và dễ bảo trì. |
| Dài hạn | Chuẩn hóa migration database, thêm test tự động, bổ sung source Smart Contract và script deploy. | Dự án đạt mức hoàn thiện tốt hơn cho triển khai thực tế và nghiên cứu mở rộng. |

### Hướng mở rộng

Phần mở rộng dưới đây được đề xuất theo hướng phát triển hệ thống từ bản demo đồ án thành một nền tảng e-commerce truy xuất nguồn gốc có khả năng triển khai thực tế.

### Mở rộng chức năng người dùng

| Tính năng | Mô tả | Lợi ích |
| --- | --- | --- |
| Tra cứu sản phẩm bằng QR code | Sinh QR cho từng sản phẩm hoặc từng lô hàng; QR dẫn tới trang chi tiết truy xuất nguồn gốc. | Khách hàng có thể kiểm tra nhanh nguồn gốc sản phẩm ngay trên bao bì. |
| Wishlist/Yêu thích | Cho phép khách hàng lưu sản phẩm quan tâm. | Tăng trải nghiệm mua sắm và hỗ trợ remarketing. |
| Theo dõi đơn hàng dạng timeline | Hiển thị các mốc: tạo đơn, xác nhận, đóng gói, đang giao, đã giao. | Giúp khách hàng dễ theo dõi tiến trình xử lý đơn. |
| Thông báo trạng thái đơn | Gửi email hoặc thông báo trong app khi đơn hàng đổi trạng thái. | Giảm nhu cầu khách phải tự kiểm tra thủ công. |
| Reset mật khẩu | Gửi link đặt lại mật khẩu qua email. | Hoàn thiện luồng tài khoản người dùng. |

### Mở rộng chức năng quản trị

| Tính năng | Mô tả | Lợi ích |
| --- | --- | --- |
| Quản lý lô sản xuất | Thêm thực thể batch/lot; mỗi lô có mã riêng, tồn kho riêng và lịch sử Blockchain riêng. | Phù hợp hơn với sản xuất thực tế, truy xuất được từng lô hàng. |
| Quản lý tồn kho nâng cao | Theo dõi lịch sử nhập/xuất kho, cảnh báo sắp hết hàng, kiểm kê tồn. | Giúp admin vận hành kho chính xác hơn. |
| Quản lý đánh giá | Admin có thể lọc, tìm kiếm, ẩn/hiện đánh giá không phù hợp. | Kiểm soát nội dung do người dùng tạo. |
| Quản lý khách hàng | Xem lịch sử mua hàng, tổng chi tiêu, số đơn, địa chỉ của từng khách. | Hỗ trợ chăm sóc khách hàng và phân tích hành vi mua. |
| Xuất báo cáo | Xuất doanh thu, đơn hàng, sản phẩm bán chạy ra Excel/PDF. | Phục vụ báo cáo kinh doanh và quản trị. |

### Mở rộng Blockchain và truy xuất nguồn gốc

| Tính năng | Mô tả | Lợi ích |
| --- | --- | --- |
| Hiển thị transaction hash | Lưu và hiển thị `tx_hash` cho từng công đoạn, cho phép mở explorer. | Tăng khả năng kiểm chứng độc lập. |
| Chuẩn hóa Smart Contract source | Bổ sung `DNCTrace.sol`, script deploy, network config và tài liệu triển khai. | Hoàn thiện phần Blockchain về mặt kỹ thuật và học thuật. |
| Gắn Blockchain theo lô hàng | Ghi dữ liệu theo batch thay vì chỉ theo product. | Đảm bảo truy xuất chính xác đúng lô sản xuất. |
| Kiểm chứng dữ liệu off-chain/on-chain | Hash dữ liệu chi tiết trong database và lưu hash lên Blockchain. | Giảm chi phí gas nhưng vẫn đảm bảo dữ liệu không bị chỉnh sửa âm thầm. |
| Phân quyền ghi dữ liệu chuỗi cung ứng | Chỉ ví admin hoặc ví staff được phép ghi công đoạn. | Tăng tính kiểm soát và an toàn dữ liệu Blockchain. |

### Mở rộng thanh toán và vận hành

| Tính năng | Mô tả | Lợi ích |
| --- | --- | --- |
| Xác nhận VietQR tự động | Tích hợp webhook ngân hàng/cổng thanh toán để xác nhận giao dịch. | Giảm gian lận và giảm thao tác thủ công. |
| Tích hợp đơn vị vận chuyển | Kết nối API vận chuyển để tạo vận đơn và cập nhật trạng thái giao hàng. | Hoàn thiện quy trình bán hàng thực tế. |
| Mã giảm giá/voucher | Thêm bảng voucher, điều kiện áp dụng, thời gian hiệu lực. | Hỗ trợ marketing và khuyến mãi. |
| Phí vận chuyển động | Tính phí theo khu vực, khối lượng hoặc giá trị đơn hàng. | Phù hợp hơn với vận hành thương mại điện tử. |

### Mở rộng kỹ thuật hệ thống

| Tính năng | Mô tả | Lợi ích |
| --- | --- | --- |
| Docker hóa | Tạo `docker-compose.yml` cho backend, frontend và MySQL. | Dễ cài đặt, dễ demo, giảm lỗi khác biệt môi trường. |
| Test tự động | Viết test API cho auth, checkout, order, review và admin. | Giảm lỗi khi phát triển thêm tính năng. |
| CI/CD | Tự động lint, test và build khi đẩy code. | Chuẩn hóa quy trình phát triển phần mềm. |
| Logging tập trung | Ghi log request/error theo cấu trúc, có request id. | Dễ debug và theo dõi lỗi production. |
| Tối ưu bảo mật API | Thêm rate limit, helmet, validate input, refresh token. | Giảm rủi ro tấn công và tăng độ tin cậy hệ thống. |
| Triển khai production | Tách cấu hình dev/prod, dùng reverse proxy, HTTPS, build frontend tối ưu. | Sẵn sàng triển khai lên server thật. |

### Lộ trình phát triển đề xuất

| Giai đoạn | Trọng tâm | Hạng mục tiêu biểu |
| --- | --- | --- |
| Giai đoạn 1 - Hoàn thiện nền tảng | Ổn định hệ thống hiện có | Test checkout/giỏ hàng, cấu hình email production, kiểm tra token hết hạn, chuẩn hóa response lỗi. |
| Giai đoạn 2 - Hoàn thiện nghiệp vụ e-commerce | Nâng cấp trải nghiệm mua hàng và quản trị | Timeline đơn hàng, voucher, quản lý khách hàng, báo cáo Excel/PDF. |
| Giai đoạn 3 - Nâng cấp truy xuất nguồn gốc | Làm Blockchain sâu và thực tế hơn | QR theo lô hàng, transaction explorer, hash off-chain/on-chain, quản lý batch. |
| Giai đoạn 4 - Sẵn sàng triển khai thật | Chuẩn hóa vận hành production | Docker, CI/CD, logging, test tự động, HTTPS và cấu hình production. |
