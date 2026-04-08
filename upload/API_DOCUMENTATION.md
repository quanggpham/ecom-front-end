# API Documentation - E-commerce Backend

**Base URL:** `http://localhost:8080/api/v1`

**Chung:** Mọi API cần xác thực (trừ Auth, Products GET, Categories GET, Banners GET, Promotion Banners GET) đều cần header:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Format Response:**
```json
{
  "status": 200,
  "message": "Thông báo",
  "data": { ... },
  "timestamp": "2026-03-12T10:00:00"
}
```

---

## 1. Authentication (`/api/v1/auth`)

### 1.1 Đăng ký
**POST** `/auth/register`

| Auth | Body |
|------|------|
| Không | Có |

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Đăng nhập
**POST** `/auth/login`

| Auth | Body |
|------|------|
| Không | Có |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Profile (`/api/v1/profile`)

### 2.1 Lấy thông tin cá nhân
**GET** `/profile`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy thông tin cá nhân thành công",
  "data": {
    "id": 1,
    "username": "nguyenvana",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "imageUrl": null,
    "address": null,
    "role": "USER",
    "createAt": "2026-03-12T10:00:00"
  }
}
```

---

### 2.2 Cập nhật thông tin cá nhân
**PUT** `/profile`

**Request:**
```json
{
  "username": "nguyenvana",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Cập nhật thông tin cá nhân thành công",
  "data": {
    "id": 1,
    "username": "nguyenvana",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "USER",
    "createAt": "2026-03-12T10:00:00"
  }
}
```

---

## 3. Địa chỉ (`/api/v1/addresses`)

### 3.1 Danh sách địa chỉ
**GET** `/addresses`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách địa chỉ thành công",
  "data": [
    {
      "id": 1,
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "addressLine": "123 Đường ABC, Phường XYZ",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh",
      "isDefault": true,
      "fullAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh"
    }
  ]
}
```

---

### 3.2 Chi tiết địa chỉ
**GET** `/addresses/{id}`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy thông tin địa chỉ thành công",
  "data": {
    "id": 1,
    "recipientName": "Nguyễn Văn A",
    "phone": "0901234567",
    "addressLine": "123 Đường ABC, Phường XYZ",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "isDefault": true,
    "fullAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh"
  }
}
```

---

### 3.3 Thêm địa chỉ
**POST** `/addresses`

**Request:**
```json
{
  "recipientName": "Nguyễn Văn A",
  "phone": "0901234567",
  "addressLine": "123 Đường ABC, Phường XYZ",
  "district": "Quận 1",
  "city": "TP. Hồ Chí Minh",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Thêm địa chỉ thành công",
  "data": {
    "id": 2,
    "recipientName": "Nguyễn Văn A",
    "phone": "0901234567",
    "addressLine": "123 Đường ABC, Phường XYZ",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "isDefault": false,
    "fullAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh"
  }
}
```

---

### 3.4 Cập nhật địa chỉ
**PUT** `/addresses/{id}`

**Request:** (tất cả trường optional)
```json
{
  "recipientName": "Trần Văn B",
  "phone": "0912345678",
  "addressLine": "456 Đường XYZ",
  "district": "Quận 7",
  "city": "TP. Hồ Chí Minh",
  "isDefault": true
}
```

**Response (200):** Giống 3.2

---

### 3.5 Đặt địa chỉ mặc định
**PUT** `/addresses/{id}/default`

| Body |
|------|
| Không cần |

**Response (200):** Giống 3.2

---

### 3.6 Xóa địa chỉ
**DELETE** `/addresses/{id}`

**Response (204):**
```json
{
  "status": 204,
  "message": "Xóa địa chỉ thành công",
  "data": null
}
```

---

## 4. Giỏ hàng (`/api/v1/carts`)

### 4.1 Thêm vào giỏ
**POST** `/carts/add`

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Thêm vào giỏ hàng thành công!"
}
```

---

### 4.2 Lấy giỏ hàng
**GET** `/carts`

**Response (200):**
```json
{
  "status": 200,
  "message": "Get giỏ hàng thành công",
  "data": {
    "cartId": 1,
    "items": [
      {
        "itemId": 1,
        "productId": 1,
        "productName": "Phở bò",
        "imageUrl": null,
        "price": 45000,
        "quantity": 2,
        "subTotal": 90000
      }
    ],
    "totalAmt": 90000
  }
}
```

---

### 4.3 Cập nhật số lượng
**PUT** `/carts/item`

**Request:**
```json
{
  "productId": 1,
  "quantity": 3
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Cập nhật số lượng thành công"
}
```

---

### 4.4 Xóa sản phẩm khỏi giỏ
**DELETE** `/carts/item/{productId}`

**Response (200):**
```json
{
  "status": 200,
  "message": "Xóa sản phẩm thành công"
}
```

---

### 4.5 Xóa toàn bộ giỏ
**DELETE** `/carts/clear`

**Response (200):**
```json
{
  "status": 200,
  "message": "Giỏ hàng đã được dọn sạch"
}
```

---

## 5. Đơn hàng (`/api/v1/orders`)

### 5.1 Đặt hàng (Checkout)
**POST** `/orders`

**Request:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "note": "Giao giờ hành chính",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "code": "GIAM50K"
}
```

**paymentMethod:** `COD` | `BANK_TRANSFER` | `CREDIT` | `VNPAY` | `MOMO` | `SEPAY`

**Response (201):**
```json
{
  "status": 201,
  "message": "Đặt đơn hàng thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
    "note": "Giao giờ hành chính",
    "status": "PENDING",
    "paymentMethod": "COD",
    "subTotal": 150000,
    "discountAmount": 50000,
    "totalMoney": 100000,
    "createdAt": "2026-03-12 10:00:00",
    "orderDetails": [
      {
        "id": 1,
        "name": "Phở bò",
        "price": 45000,
        "quantity": 2
      }
    ]
  }
}
```

**status:** `PENDING` | `CONFIRMED` | `SHIPPING` | `COMPLETED` | `CANCELLED`

---

### 5.2 Danh sách đơn hàng của tôi
**GET** `/orders?page=0&size=10&sort=createdAt,desc`

**Response (200):**
```json
{
  "status": 200,
  "message": "Xem danh sách đơn hàng thành công",
  "data": {
    "currentPage": 1,
    "totalPages": 2,
    "pageSize": 10,
    "totalElements": 15,
    "items": [
      {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "status": "COMPLETED",
        "totalMoney": 100000,
        "createdAt": "2026-03-12 10:00:00",
        "orderDetails": [...]
      }
    ]
  }
}
```

---

### 5.3 Chi tiết đơn hàng
**GET** `/orders/{id}`

**Response (200):** Giống object trong `items` của 5.2

---

### 5.4 Hủy đơn hàng
**PUT** `/orders/cancel/{id}`

| Body |
|------|
| Không cần |

**Response (200):**
```json
{
  "status": 200,
  "message": "Hủy đơn hàng thành công"
}
```

---

## 6. Mã giảm giá (`/api/v1/coupons`)

### 6.1 Tạo mã giảm giá (Admin)
**POST** `/coupons`

| Auth |
|------|
| ADMIN |

**Request:**
```json
{
  "code": "GIAM20SP",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "maxDiscountAmount": 50000,
  "promotionType": "PRODUCT",
  "categoryId": null,
  "productId": 42,
  "minOrderValue": 100000,
  "usageLimit": 100,
  "startDate": "2026-04-10",
  "expirationDate": "2026-05-01",
  "active": true
}
```

**Business Rules:**
- `promotionType=ORDER`: không được truyền `categoryId`, `productId`
- `promotionType=CATEGORY`: bắt buộc có `categoryId`, không được có `productId`
- `promotionType=PRODUCT`: bắt buộc có `productId`, không được có `categoryId`
- `discountType=PERCENTAGE`: bắt buộc có `maxDiscountAmount`

**Response (201):**
```json
{
  "status": 201,
  "message": "Tạo mã giảm giá thành công",
  "data": {
    "id": 1,
    "code": "GIAM20SP",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "maxDiscountAmount": 50000,
    "promotionType": "PRODUCT",
    "categoryId": null,
    "productId": 42,
    "minOrderValue": 100000,
    "usageLimit": 100,
    "usedCount": 0,
    "startDate": "2026-04-10",
    "expirationDate": "2026-05-01",
    "active": true,
    "createdAt": "2026-04-08"
  }
}
```

---

### 6.2 Danh sách mã giảm giá (Admin)
**GET** `/coupons?promotionType=PRODUCT&categoryId=3&productId=42&page=0&size=10`

| Auth |
|------|
| ADMIN |

**Query params:**
- `promotionType` - `ORDER | CATEGORY | PRODUCT` (optional)
- `categoryId` (optional)
- `productId` (optional)
- `page`, `size`, `sort`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 10,
    "totalElements": 1,
    "items": [
      {
        "id": 1,
        "code": "GIAM20SP",
        "discountType": "PERCENTAGE",
        "discountValue": 20,
        "maxDiscountAmount": 50000,
        "promotionType": "PRODUCT",
        "categoryId": null,
        "productId": 42,
        "minOrderValue": 100000,
        "usageLimit": 100,
        "usedCount": 0,
        "startDate": "2026-04-10",
        "expirationDate": "2026-05-01",
        "active": true,
        "createdAt": "2026-04-08"
      }
    ]
  }
}
```

---

### 6.3 Chi tiết mã giảm giá (Admin)
**GET** `/coupons/{id}`

| Auth |
|------|
| ADMIN |

**Response (200):** Giống object trong `items` của 6.2

---

### 6.4 Cập nhật mã giảm giá (Admin)
**PUT** `/coupons/{id}`

| Auth |
|------|
| ADMIN |

**Request:** Giống 6.1

**Response (200):** Giống object trong 6.1

---

### 6.5 Xóa mã giảm giá (Admin)
**DELETE** `/coupons/{id}`

| Auth |
|------|
| ADMIN |

**Response (204):**
```json
{
  "status": 204,
  "message": "Xóa mã giảm giá thành công",
  "data": null
}
```

---

### 6.6 Bật/tắt mã giảm giá (Admin)
**PATCH** `/coupons/{id}/status?active=true`

| Auth |
|------|
| ADMIN |

**Response (200):**
```json
{
  "status": 200,
  "message": "Đã kích hoạt mã giảm giá"
}
```

---

### 6.7 Tính tiền giảm giá (User)
**POST** `/coupons/calculate`

| Auth |
|------|
| Đăng nhập |

**Request:**
```json
{
  "code": "GIAM20SP",
  "items": [
    {
      "productId": 42,
      "quantity": 2
    },
    {
      "productId": 9,
      "quantity": 1
    }
  ]
}
```

**Logic áp dụng:**
- `ORDER`: giảm trên toàn bộ đơn hàng
- `CATEGORY`: chỉ giảm trên tổng tiền item có cùng `categoryId`
- `PRODUCT`: chỉ giảm trên item có `productId` khớp
- `appliedToItems` hiện trả về danh sách `productId` được áp dụng giảm giá
- Nếu coupon hợp lệ nhưng không khớp item nào trong đơn cho `CATEGORY/PRODUCT`, API trả lỗi nghiệp vụ

**Response (200):**
```json
{
  "status": 200,
  "message": "Tính toán số tiền giảm giá thành công",
  "data": {
    "discountAmount": 25000,
    "appliedToItems": [42],
    "promotionType": "PRODUCT"
  }
}
```

---

## 7. Danh mục (`/api/v1/categories`)

### 7.1 Danh sách danh mục
**GET** `/categories`

| Auth |
|------|
| Không |

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách thành công",
  "data": [
    {
      "id": 1,
      "name": "Đồ ăn nhanh",
      "description": null
    }
  ]
}
```

---

### 7.2 Chi tiết danh mục
**GET** `/categories/{id}`

| Auth |
|------|
| Không |

**Response (200):** Giống object trong mảng 7.1

---

## 8. Sản phẩm (`/api/v1/products`)

### 8.1 Tìm kiếm / Danh sách
**GET** `/products?page=0&size=10&sort=id,asc&name=phở&categoryId=1&minPrice=10000&maxPrice=100000`

**Query params:**
- `page` (default: 0)
- `size` (default: 10)
- `sort` (vd: `id,asc`, `price,desc`)
- `name` - tìm theo tên
- `categoryId` - lọc theo danh mục
- `minPrice` - giá tối thiểu
- `maxPrice` - giá tối đa

| Auth |
|------|
| Không |

**Response (200):**
```json
{
  "status": 200,
  "message": "Tìm kiếm thành công",
  "data": {
    "currentPage": 1,
    "totalPages": 3,
    "pageSize": 10,
    "totalElements": 25,
    "items": [
      {
        "id": 1,
        "name": "Phở bò",
        "description": "Phở bò đặc biệt",
        "price": 45000,
        "stockQuantity": 100,
        "imageUrl": null,
        "isActive": true,
        "category": {
          "id": 1,
          "name": "Đồ ăn nhanh",
          "description": null
        },
        "createdAt": "2026-03-12T10:00:00"
      }
    ]
  }
}
```

---

### 8.2 Chi tiết sản phẩm
**GET** `/products/{id}`

| Auth |
|------|
| Không |

**Response (200):** Giống object trong `items` của 8.1

---

## 9. Banner (`/api/v1/banners`, `/api/v1/admin/banners`)

### 9.1 Lấy danh sách banner đang hiển thị
**GET** `/banners`

| Auth |
|------|
| Không |

**Mô tả:**
- Chỉ trả về banner có `isActive = true`
- Chỉ trả về banner đang nằm trong thời gian hiển thị hợp lệ:
  `(startDate == null || startDate <= now) && (endDate == null || endDate >= now)`
- Sắp xếp theo `displayOrder ASC`, sau đó đến `id ASC`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách banner đang hiển thị thành công",
  "data": [
    {
      "id": 1,
      "title": "Phở Bò Hà Nội",
      "subtitle": "Hương vị truyền thống",
      "description": "Phở bò truyền thống với nước dùng đậm đà.",
      "imageUrl": "https://example.com/banners/pho-bo.jpg",
      "linkUrl": "/products/1",
      "badgeText": "Best Seller",
      "badgeIcon": "FLAME",
      "overlayColor": "from-amber-500/80",
      "displayOrder": 0,
      "isActive": true,
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-04-08T09:00:00",
      "updatedAt": "2026-04-08T09:00:00"
    }
  ]
}
```

---

### 9.2 Admin lấy tất cả banner
**GET** `/admin/banners?page=0&size=10`

| Auth |
|------|
| ADMIN |

**Mô tả:**
- Trả về toàn bộ banner, gồm cả `inactive`
- Có phân trang
- Mặc định sắp xếp theo `displayOrder ASC`, sau đó đến `id ASC`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách banner thành công",
  "data": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 10,
    "totalElements": 2,
    "items": [
      {
        "id": 1,
        "title": "Phở Bò Hà Nội",
        "subtitle": "Hương vị truyền thống",
        "description": "Phở bò truyền thống với nước dùng đậm đà.",
        "imageUrl": "https://example.com/banners/pho-bo.jpg",
        "linkUrl": "/products/1",
        "badgeText": "Best Seller",
        "badgeIcon": "FLAME",
        "overlayColor": "from-amber-500/80",
        "displayOrder": 0,
        "isActive": true,
        "startDate": null,
        "endDate": null,
        "createdAt": "2026-04-08T09:00:00",
        "updatedAt": "2026-04-08T09:00:00"
      }
    ]
  }
}
```

---

### 9.3 Admin lấy chi tiết banner
**GET** `/admin/banners/{id}`

| Auth |
|------|
| ADMIN |

**Response (200):** Giống object trong `items` của 9.2

---

### 9.4 Admin tạo banner
**POST** `/admin/banners`

| Auth |
|------|
| ADMIN |

**Request:**
```json
{
  "title": "Phở Bò Hà Nội",
  "subtitle": "Hương vị truyền thống",
  "description": "Phở bò truyền thống với nước dùng đậm đà.",
  "imageUrl": "https://example.com/banners/pho-bo.jpg",
  "linkUrl": "/products/1",
  "badgeText": "Best Seller",
  "badgeIcon": "FLAME",
  "overlayColor": "from-amber-500/80",
  "displayOrder": 0,
  "isActive": true,
  "startDate": "2026-04-10T00:00:00",
  "endDate": "2026-05-01T23:59:59"
}
```

**Validation / Business Rules:**
- `title` là bắt buộc
- `imageUrl` là bắt buộc
- `displayOrder` phải `>= 0`
- Nếu có đủ cả `startDate` và `endDate` thì `startDate` không được lớn hơn `endDate`
- `badgeIcon` hỗ trợ: `FLAME | STAR | TAG | GIFT | NONE`

**Response (201):**
```json
{
  "status": 201,
  "message": "Tạo banner thành công",
  "data": {
    "id": 1,
    "title": "Phở Bò Hà Nội",
    "subtitle": "Hương vị truyền thống",
    "description": "Phở bò truyền thống với nước dùng đậm đà.",
    "imageUrl": "https://example.com/banners/pho-bo.jpg",
    "linkUrl": "/products/1",
    "badgeText": "Best Seller",
    "badgeIcon": "FLAME",
    "overlayColor": "from-amber-500/80",
    "displayOrder": 0,
    "isActive": true,
    "startDate": "2026-04-10T00:00:00",
    "endDate": "2026-05-01T23:59:59",
    "createdAt": "2026-04-08T09:00:00",
    "updatedAt": "2026-04-08T09:00:00"
  }
}
```

---

### 9.5 Admin cập nhật banner
**PUT** `/admin/banners/{id}`

| Auth |
|------|
| ADMIN |

**Request:** Giống 9.4

**Response (200):** Giống object trong 9.4

---

### 9.6 Admin xóa banner
**DELETE** `/admin/banners/{id}`

| Auth |
|------|
| ADMIN |

**Response (204):**
```json
{
  "status": 204,
  "message": "Xóa banner thành công",
  "data": null
}
```

---

### 9.7 Admin bật/tắt nhanh banner
**PATCH** `/admin/banners/{id}/status?active=true`

| Auth |
|------|
| ADMIN |

**Query params:** `active=true|false`

**Response (200):**
```json
{
  "status": 200,
  "message": "Đã kích hoạt banner"
}
```
hoặc
```json
{
  "status": 200,
  "message": "Đã vô hiệu hóa banner"
}
```

---

### 9.8 Admin cập nhật thứ tự hiển thị hàng loạt
**PATCH** `/admin/banners/reorder`

| Auth |
|------|
| ADMIN |

**Request:**
```json
[
  {
    "id": 1,
    "displayOrder": 0
  },
  {
    "id": 2,
    "displayOrder": 1
  }
]
```

**Tại sao request cần `id`:**
- API này cập nhật thứ tự cho nhiều banner cùng lúc
- `id` dùng để xác định chính xác banner nào đang được gán `displayOrder` mới
- Nếu chỉ gửi mảng số thứ tự, backend sẽ không biết thứ tự đó thuộc banner nào

**Response (200):**
```json
{
  "status": 200,
  "message": "Cập nhật thứ tự banner thành công",
  "data": [
    {
      "id": 1,
      "title": "Phở Bò Hà Nội",
      "subtitle": "Hương vị truyền thống",
      "description": "Phở bò truyền thống với nước dùng đậm đà.",
      "imageUrl": "https://example.com/banners/pho-bo.jpg",
      "linkUrl": "/products/1",
      "badgeText": "Best Seller",
      "badgeIcon": "FLAME",
      "overlayColor": "from-amber-500/80",
      "displayOrder": 0,
      "isActive": true,
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-04-08T09:00:00",
      "updatedAt": "2026-04-08T09:15:00"
    }
  ]
}
```

---

### 9.9 Upload ảnh banner
**POST** `/media/upload`

| Auth |
|------|
| ADMIN |

**Mô tả:**
- Dùng `multipart/form-data`
- Upload qua media API hiện có để lấy `imageUrl`, sau đó truyền URL này vào `POST /admin/banners` hoặc `PUT /admin/banners/{id}`

**Response (200):**
```json
{
  "status": 200,
  "message": "Tải ảnh lên thành công",
  "data": "https://res.cloudinary.com/.../banner.jpg"
}
```

---

## 10. Promotion Banners (`/api/v1/promotion-banners`, `/api/v1/admin/promotion-banners`)

### 10.1 Lấy danh sách promotion banner đang hiển thị
**GET** `/promotion-banners`

| Auth |
|------|
| Không |

**Mô tả:**
- Chỉ trả về promotion banner có `isActive = true`
- Chỉ trả về record đang nằm trong thời gian hợp lệ:
  `(startDate == null || startDate <= now) && (endDate == null || endDate >= now)`
- Sắp xếp theo `displayOrder ASC`, sau đó đến `id ASC`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách promotion banner thành công",
  "data": [
    {
      "id": 1,
      "title": "Combo Gia Đình",
      "discountLabel": "Giảm 30%",
      "couponCode": "COMBO30",
      "description": "Ưu đãi cho đơn hàng gia đình cuối tuần.",
      "linkUrl": "/khuyen-mai/combo-gia-dinh",
      "bgColor": "bg-white/15",
      "displayOrder": 0,
      "isActive": true,
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-04-08T09:00:00"
    }
  ]
}
```

---

### 10.2 Admin lấy tất cả promotion banner
**GET** `/admin/promotion-banners?page=0&size=10`

| Auth |
|------|
| ADMIN |

**Response (200):**
```json
{
  "status": 200,
  "message": "Lấy danh sách promotion banner thành công",
  "data": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 10,
    "totalElements": 1,
    "items": [
      {
        "id": 1,
        "title": "Combo Gia Đình",
        "discountLabel": "Giảm 30%",
        "couponCode": "COMBO30",
        "description": "Ưu đãi cho đơn hàng gia đình cuối tuần.",
        "linkUrl": "/khuyen-mai/combo-gia-dinh",
        "bgColor": "bg-white/15",
        "displayOrder": 0,
        "isActive": true,
        "startDate": null,
        "endDate": null,
        "createdAt": "2026-04-08T09:00:00"
      }
    ]
  }
}
```

---

### 10.3 Admin lấy chi tiết promotion banner
**GET** `/admin/promotion-banners/{id}`

| Auth |
|------|
| ADMIN |

**Response (200):** Giống object trong `items` của 10.2

---

### 10.4 Admin tạo promotion banner
**POST** `/admin/promotion-banners`

| Auth |
|------|
| ADMIN |

**Request:**
```json
{
  "title": "Combo Gia Đình",
  "discountLabel": "Giảm 30%",
  "couponCode": "COMBO30",
  "description": "Ưu đãi cho đơn hàng gia đình cuối tuần.",
  "linkUrl": "/khuyen-mai/combo-gia-dinh",
  "bgColor": "bg-white/15",
  "displayOrder": 0,
  "isActive": true,
  "startDate": "2026-04-10T00:00:00",
  "endDate": "2026-05-01T23:59:59"
}
```

**Response (201):** Giống object trong 10.1

---

### 10.5 Admin cập nhật promotion banner
**PUT** `/admin/promotion-banners/{id}`

| Auth |
|------|
| ADMIN |

**Request:** Giống 10.4

**Response (200):** Giống object trong 10.1

---

### 10.6 Admin xóa promotion banner
**DELETE** `/admin/promotion-banners/{id}`

| Auth |
|------|
| ADMIN |

**Response (204):**
```json
{
  "status": 204,
  "message": "Xóa promotion banner thành công",
  "data": null
}
```

---

### 10.7 Admin bật/tắt promotion banner
**PATCH** `/admin/promotion-banners/{id}/status?active=false`

| Auth |
|------|
| ADMIN |

**Response (200):**
```json
{
  "status": 200,
  "message": "Đã vô hiệu hóa promotion banner"
}
```

---

### 10.8 Admin sắp xếp promotion banner hàng loạt
**PATCH** `/admin/promotion-banners/reorder`

| Auth |
|------|
| ADMIN |

**Request:**
```json
[
  {
    "id": 1,
    "displayOrder": 0
  },
  {
    "id": 2,
    "displayOrder": 1
  }
]
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Cập nhật thứ tự promotion banner thành công",
  "data": [
    {
      "id": 1,
      "title": "Combo Gia Đình",
      "discountLabel": "Giảm 30%",
      "couponCode": "COMBO30",
      "description": "Ưu đãi cho đơn hàng gia đình cuối tuần.",
      "linkUrl": "/khuyen-mai/combo-gia-dinh",
      "bgColor": "bg-white/15",
      "displayOrder": 0,
      "isActive": true,
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-04-08T09:00:00"
    }
  ]
}
```

---

## 11. AI Chat (`/api/v1/ai`)

### 9.1 Chat (JSON)
**GET** `/ai/chat?message=Quán có món gì ngon?`

| Auth |
|------|
| Không |

**Response (200):**
```json
{
  "status": 200,
  "message": null,
  "data": "Dựa trên thực đơn, quán có các món..."
}
```

---

### 9.2 Chat Stream (SSE)
**GET** `/ai/chat/stream?message=Quán có món gì ngon?`

**Response:** `text/event-stream` - Server-Sent Events

---

## 12. Enums tham khảo

### PaymentMethod
`COD` | `BANK_TRANSFER` | `CREDIT` | `VNPAY` | `MOMO` | `SEPAY`

### OrderStatus
`PENDING` | `CONFIRMED` | `SHIPPING` | `COMPLETED` | `CANCELLED`

### Role
`USER` | `ADMIN`

### BannerBadgeIcon
`FLAME` | `STAR` | `TAG` | `GIFT` | `NONE`

### PromotionType
`ORDER` | `CATEGORY` | `PRODUCT`

---

## 13. Phân quyền

| Endpoint | Quyền |
|----------|-------|
| `/auth/**` | Public |
| `GET /categories/**`, `GET /products/**`, `GET /banners/**`, `GET /promotion-banners/**` | Public |
| `/ai/**`, `/payments/**` | Public |
| `/profile/**`, `/addresses/**`, `/carts/**`, `/orders/**`, `POST /coupons/calculate` | Đăng nhập |
| `/users/**`, `/admin/**`, `POST|PUT|DELETE /categories/**`, `/coupons/**` (trừ calculate), `/media/upload` | ADMIN |

---

## 14. Mã lỗi thường gặp

| HTTP | Ý nghĩa |
|------|---------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập / Token hết hạn |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 500 | Server Error - Lỗi hệ thống |
---

## 15. Review & Rating APIs

### 13.1 Lấy danh sách review của sản phẩm
**GET** `/products/{id}/reviews?rating=5&page=0&size=10&sort=createdAt,desc`

**Query params:**
- `rating` - lọc theo số sao `1..5` (optional)
- `page` (default: 0)
- `size` (default: 10)
- `sort` (vd: `createdAt,desc`)

| Auth |
|------|
| Không |

**Mô tả:**
- Chỉ trả review đã duyệt (`APPROVED`)
- Kèm phần `stats` từ bảng cache `product_stats`

**Response (200):**
```json
{
  "status": 200,
  "message": "Lay danh sach review thanh cong",
  "data": {
    "stats": {
      "productId": 1,
      "avgRating": 4.50,
      "totalReviews": 12,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 1,
        "4": 2,
        "5": 8
      }
    },
    "reviews": {
      "currentPage": 1,
      "totalPages": 2,
      "pageSize": 10,
      "totalElements": 12,
      "items": [
        {
          "id": 101,
          "productId": 1,
          "productName": "Phở bò",
          "orderItemId": 1001,
          "userId": 5,
          "userName": "Nguyễn Văn A",
          "rating": 5,
          "content": "Món ngon, giao nhanh",
          "status": "APPROVED",
          "reportCount": 0,
          "sellerReply": "Cảm ơn bạn đã ủng hộ!",
          "rejectionReason": null,
          "sellerReplyAt": "2026-03-27T10:30:00",
          "createdAt": "2026-03-27T09:00:00",
          "updatedAt": "2026-03-27T10:30:00"
        }
      ]
    }
  }
}
```

---

### 13.2 Tạo review mới
**POST** `/reviews`

| Auth |
|------|
| Bắt buộc |

**Request:**
```json
{
  "orderItemId": 1001,
  "rating": 5,
  "content": "Món ăn rất ngon, đóng gói cẩn thận"
}
```

**Validation / Business Rules:**
- `orderItemId` phải thuộc về user đang đăng nhập
- Đơn hàng chứa `orderItemId` phải có trạng thái `COMPLETED`
- Mỗi `orderItemId` chỉ được review 1 lần
- `rating` trong khoảng `1..5`
- API có rate limiting để chống spam
- Nội dung sẽ được sanitize để giảm nguy cơ XSS
- Nếu nội dung chứa từ khóa cấm, review sẽ bị `REJECTED` ngay
- Nếu hợp lệ bình thường, review mặc định `PENDING`

**Response (201):**
```json
{
  "status": 201,
  "message": "Tao review thanh cong",
  "data": {
    "id": 101,
    "productId": 1,
    "productName": "Phở bò",
    "orderItemId": 1001,
    "userId": 5,
    "userName": "Nguyễn Văn A",
    "rating": 5,
    "content": "Món ăn rất ngon, đóng gói cẩn thận",
    "status": "PENDING",
    "reportCount": 0,
    "sellerReply": null,
    "rejectionReason": null,
    "sellerReplyAt": null,
    "createdAt": "2026-03-27T09:00:00",
    "updatedAt": "2026-03-27T09:00:00"
  }
}
```

---

### 13.3 Người bán trả lời review
**POST** `/seller/reviews/{id}/reply`

| Auth |
|------|
| Seller-side / hiện tại backend đang bảo vệ bằng ADMIN |

**Request:**
```json
{
  "reply": "Cảm ơn bạn đã phản hồi, shop sẽ tiếp tục cải thiện."
}
```

**Rule:**
- Chỉ trả lời được review đã `APPROVED`
- Mỗi review chỉ trả lời 1 lần

**Response (200):**
```json
{
  "status": 200,
  "message": "Tra loi review thanh cong",
  "data": {
    "id": 101,
    "productId": 1,
    "productName": "Phở bò",
    "orderItemId": 1001,
    "userId": 5,
    "userName": "Nguyễn Văn A",
    "rating": 5,
    "content": "Món ngon, giao nhanh",
    "status": "APPROVED",
    "reportCount": 0,
    "sellerReply": "Cảm ơn bạn đã phản hồi, shop sẽ tiếp tục cải thiện.",
    "rejectionReason": null,
    "sellerReplyAt": "2026-03-27T10:30:00",
    "createdAt": "2026-03-27T09:00:00",
    "updatedAt": "2026-03-27T10:30:00"
  }
}
```

---

### 13.4 Danh sách đơn hàng / sản phẩm có thể review
**GET** `/users/me/reviewable-orders`

| Auth |
|------|
| Bắt buộc |

**Mô tả:**
- Chỉ lấy các `order item` thuộc user
- Đơn hàng phải ở trạng thái `COMPLETED`
- Loại bỏ các item đã có review

**Response (200):**
```json
{
  "status": 200,
  "message": "Lay danh sach order co the review thanh cong",
  "data": [
    {
      "orderId": 10,
      "status": "COMPLETED",
      "createdAt": "2026-03-25T18:00:00",
      "items": [
        {
          "orderItemId": 1001,
          "productId": 1,
          "productName": "Phở bò",
          "imageUrl": "https://example.com/images/pho-bo.jpg",
          "quantity": 2
        }
      ]
    }
  ]
}
```

---

### 13.5 Admin lấy danh sách review cần duyệt
**GET** `/admin/reviews?productId=1&userId=5&status=PENDING&minReportCount=3&page=0&size=10`

**Query params:**
- `productId` - lọc theo sản phẩm (optional)
- `userId` - lọc theo user review (optional)
- `status` - `PENDING|APPROVED|REJECTED` (optional)
- `minReportCount` - ngưỡng report tối thiểu (optional, default hiện tại là `3`)
- `page`, `size`, `sort`

| Auth |
|------|
| ADMIN |

**Mô tả:**
- Nếu không truyền filter, API ưu tiên lấy review `PENDING` hoặc review bị report nhiều

**Response (200):**
```json
{
  "status": 200,
  "message": "Lay danh sach review can duyet thanh cong",
  "data": {
    "currentPage": 1,
    "totalPages": 1,
    "pageSize": 10,
    "totalElements": 1,
    "items": [
      {
        "id": 101,
        "productId": 1,
        "productName": "Phở bò",
        "orderItemId": 1001,
        "userId": 5,
        "userName": "Nguyễn Văn A",
        "rating": 5,
        "content": "Món ăn rất ngon",
        "status": "PENDING",
        "reportCount": 0,
        "sellerReply": null,
        "rejectionReason": null,
        "sellerReplyAt": null,
        "createdAt": "2026-03-27T09:00:00",
        "updatedAt": "2026-03-27T09:00:00"
      }
    ]
  }
}
```

---

### 13.6 Admin duyệt / từ chối review
**PATCH** `/admin/reviews/{id}/status`

| Auth |
|------|
| ADMIN |

**Request approve:**
```json
{
  "status": "APPROVED",
  "rejectionReason": null
}
```

**Request reject:**
```json
{
  "status": "REJECTED",
  "rejectionReason": "Nội dung không phù hợp với chính sách kiểm duyệt"
}
```

**Rule:**
- Chỉ chấp nhận `APPROVED` hoặc `REJECTED`
- Khi `APPROVED`: publish event để cập nhật bảng `product_stats` bất đồng bộ
- Khi `REJECTED`: bắt buộc có `rejectionReason` và gửi email cho user

**Response (200):**
```json
{
  "status": 200,
  "message": "Cap nhat trang thai review thanh cong",
  "data": {
    "id": 101,
    "productId": 1,
    "productName": "Phở bò",
    "orderItemId": 1001,
    "userId": 5,
    "userName": "Nguyễn Văn A",
    "rating": 5,
    "content": "Món ăn rất ngon",
    "status": "APPROVED",
    "reportCount": 0,
    "sellerReply": null,
    "rejectionReason": null,
    "sellerReplyAt": null,
    "createdAt": "2026-03-27T09:00:00",
    "updatedAt": "2026-03-27T10:00:00"
  }
}
```

---

### 13.7 Enum mới liên quan Review
- `ReviewStatus`: `PENDING` | `APPROVED` | `REJECTED`

### 13.8 Ghi chú phân quyền cho Review APIs
- `GET /products/{id}/reviews`: Public
- `POST /reviews`: User đăng nhập
- `GET /users/me/reviewable-orders`: User đăng nhập
- `GET /admin/reviews`, `PATCH /admin/reviews/{id}/status`: ADMIN
- `POST /seller/reviews/{id}/reply`: seller-side, hiện tại backend đang map bằng quyền `ADMIN`
