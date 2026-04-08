# Hợp Đồng Tích Hợp Stripe (Frontend & Backend)

Tài liệu này mô tả chi tiết luồng giao tiếp giữa Frontend (FE) và Backend (BE) cho tính năng thanh toán Stripe, giúp Backend Developer nắm rõ yêu cầu và dễ dàng rà soát lỗi rớt luồng (mất đồng bộ trạng thái đơn hàng).

## 1. Flow Tổng Quan

1. **FE** gọi API tạo session thanh toán Stripe.
2. **BE** giao tiếp với Stripe, trả URL cho FE.
3. **FE** lưu `orderId` vào thẻ nhớ tạm và điều hướng người dùng sang trang Stripe Checkout.
4. **Người dùng** thanh toán trên cửa sổ của Stripe.
5. **Stripe** trả user về trang `/payment/success` của FE.
6. Đồng thời, **Stripe** bắn Webhook ngầm về `POST /api/v1/payments/stripe/webhook` trên **BE**.
7. Tại trang `/payment/success`, **FE** liên tục gọi API `GET /api/v1/orders/{orderId}` mỗi 3 giây để kiểm tra.
8. Nếu **BE** đã nhận Webhook và xử lý xong, API trên trả về status phù hợp => **FE** hiển thị "Thành công!".

---

## 2. Các Endpoint Cần Thiết

### 2.1. API Tạo Phiên Thanh Toán (Checkout Session)
- **Endpoint**: `POST /api/v1/payments/{orderId}/stripe/checkout`
- **FE Mong đợi**: 
  Trả về một chuỗi JSON có ít nhất field `checkoutUrl`.
  ```json
  {
    "data": {
      "sessionId": "cs_test_...",
      "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
      "publishableKey": "pk_test_..."
    }
  }
  ```

### 2.2. Webhook Xử Lý Trạng Thái Từ Stripe (Back-Channel)
- **Endpoint**: `POST /api/v1/payments/stripe/webhook`
- **Nhiệm vụ của BE**: 
  1. Lắng nghe event `checkout.session.completed` từ Stripe.
  2. Map `session` đó với `orderId` của hệ thống.
  3. Cập nhật field `status` của Order trong Database thành một trong các trạng thái thành công: **`CONFIRMED`**, hoặc **`PAID`**, hoặc **`COMPLETED`**, hoặc **`SHIPPING`**.

### 2.3. API Frontend Dùng Để Polling
- **Endpoint**: `GET /api/v1/orders/{orderId}`
- **FE Mong đợi**: 
  Mỗi 3 giây, FE sẽ gọi endpoint này. FE mong đợi field `status` nằm trong block `data` được update:
  ```json
  {
    ...
    "data": {
      "id": 123,
      "status": "CONFIRMED", // <- FE cần cái này thay đổi
      "paymentMethod": "STRIPE",
      ...
    }
  }
  ```
  *Lưu ý:* Hiện tại FE của chúng ta chấp nhận các giá trị status: `"CONFIRMED", "PAID", "COMPLETED", "SHIPPING"`.

---

## 3. Checklist Dành Cho Backend Developer Xử Lý Lỗi Frontend Quay Đều (Timeout 60s)

Nếu Frontend bị timeout ("Stripe phản hồi chậm"), tức là Frontend không nhìn thấy status thay đổi sau 60 giây. Backend Developer vui lòng rà soát:

- [ ] **Webhook có đang chạy đúng port không?** (Test bằng Stripe CLI, cần đảm bảo CLI đang trỏ đúng về localhost:8080 và web server đang chạy).
- [ ] **Webhook Endpoint Error**: Kiểm tra log console server xem Stripe bắn event vào có bị lỗi 400 (Bad Request), 403, 500 do parsing Payload hoặc sai `STRIPE_WEBHOOK_SECRET` không?
- [ ] **Code Update Logic**: Khi nhận event `checkout.session.completed`, Backend đã tìm ra Order và thực hiện câu lệnh `UPDATE` hay chưa? Có bị lỗi transaction rollback nào không?
- [ ] **API GET Order Data**: Khi lưu vào Database thành `CONFIRMED`, thì api `GET /api/v1/orders/{orderId}` có load ra status mới không, hay bị dính Cache (Redis/v.v.) của Hibernate/JPA? 

*Hy vọng tài liệu này sẽ giúp anh rà soát và fix dứt điểm tình trạng lệch pha logic giữa FE/BE.*
