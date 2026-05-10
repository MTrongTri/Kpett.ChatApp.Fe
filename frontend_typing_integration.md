# Tài liệu Tích hợp SignalR: Tính năng Typing Indicator

Tài liệu này hướng dẫn Frontend cách kết nối và sử dụng tính năng "Người dùng đang gõ phím" (Typing Indicator) thông qua SignalR `ChatHub`.

## 1. Thông tin Kết nối cơ bản

- **Hub URL**: `/chat-Hub`
- **Authentication**: Bắt buộc gửi JWT Token (thường qua parameter `access_token` nếu dùng WebSockets, hoặc Header `Authorization` nếu dùng LongPolling/SSE).

---

## 2. Các Action Frontend cần gọi (Invoke Methods)

Khi người dùng mở một cuộc hội thoại cụ thể, Frontend cần tham gia vào "phòng" (group) của cuộc hội thoại đó để có thể nhận và gửi sự kiện typing.

### 2.1. Tham gia phòng chat (`JoinConversation`)

Gọi hàm này khi user **mở** hoặc **chuyển sang** một cuộc hội thoại.

- **Method**: `JoinConversation`
- **Tham số**:
  - `conversationId` (string): ID của cuộc hội thoại.

```javascript
// Ví dụ (JS/TS)
await connection.invoke("JoinConversation", "conv-123");
```

### 2.2. Rời phòng chat (`LeaveConversation`)

Gọi hàm này khi user **đóng** cửa sổ chat hoặc chuyển sang cuộc hội thoại khác. Backend sẽ tự động dọn dẹp trạng thái typing của user nếu họ đang gõ mà rời đi.

- **Method**: `LeaveConversation`
- **Tham số**:
  - `conversationId` (string): ID của cuộc hội thoại.

```javascript
await connection.invoke("LeaveConversation", "conv-123");
```

### 2.3. Gửi trạng thái gõ phím (`SendTyping`)

Gọi hàm này khi user bắt đầu gõ hoặc ngừng gõ.

- **Method**: `SendTyping`
- **Tham số**:
  - `conversationId` (string): ID của cuộc hội thoại.
  - `userTypingPayload` (TypingEventPayload) gửi lên thông tin của user đang gõ
  - `isTyping` (boolean): `true` nếu đang gõ, `false` nếu ngừng gõ.

**Lưu ý quan trọng về logic Client-side (Debounce):**

1. **Bắt đầu gõ**: Khi user gõ phím, gọi `SendTyping(convId, true)`.
2. **Duy trì trạng thái gõ**: Backend tự động **huỷ trạng thái typing sau 5 giây** nếu không nhận được tín hiệu mới. Do đó, nếu user gõ liên tục, Frontend cần **throttle/gửi lại `SendTyping(convId, true)` mỗi 3-4 giây**.
3. **Ngừng gõ**: Khi user dừng gõ (dùng debounce ở Frontend, ví dụ sau 1-2s không gõ) hoặc blur khỏi ô input, hãy gọi `SendTyping(convId, false)` để lập tức xoá trạng thái "đang gõ" trên UI của người khác, thay vì đợi backend timeout 5s.

---

## 3. Các Sự kiện Frontend cần lắng nghe (Listen Events)

Đăng ký lắng nghe (subscribe) các sự kiện này để cập nhật UI.

### 3.1. Sự kiện `UserTyping`

Kích hoạt khi có người khác trong cùng `conversationId` thay đổi trạng thái gõ phím. Backend sẽ không gửi sự kiện này lại cho chính user đang gõ.

- **Event Name**: `UserTyping`
- **Payload** (Object):

```typescript
interface TypingEventPayload {
  userId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  conversationId: string;
  isTyping: boolean; // true: Đang gõ, false: Ngừng gõ
  timestamp: string; // Thời gian server nhận sự kiện (ISO 8601)
}
```

**Ví dụ xử lý ở Frontend**:

```javascript
connection.on("UserTyping", (payload) => {
  if (payload.isTyping) {
    // Hiển thị UI: "{payload.displayName} đang gõ..."
    showTypingIndicator(payload.conversationId, payload.userId, payload);
  } else {
    // Ẩn UI typing của user này
    hideTypingIndicator(payload.conversationId, payload.userId);
  }
});
```

### 3.2. Sự kiện `JoinedConversation` / `LeftConversation` (Tuỳ chọn)

Backend phản hồi lại để xác nhận bạn đã vào/ra phòng thành công.

- **Event Name**: `JoinedConversation` hoặc `LeftConversation`
- **Payload**: `{ conversationId: "conv-123" }`

### 3.3. Sự kiện `Error`

Nếu có lỗi (như user không có quyền truy cập conversation), server sẽ bắn lỗi về.

- **Event Name**: `Error`
- **Payload**: `string` (Câu thông báo lỗi)

---

## 4. Tóm tắt Luồng hoạt động (Workflow)

1. **User A** mở chatbox `conv-1`. Frontend gọi `JoinConversation("conv-1")`.
2. **User B** mở chatbox `conv-1`. Frontend gọi `JoinConversation("conv-1")`.
3. **User A** bắt đầu gõ chữ. Frontend gọi `SendTyping("conv-1", true)`.
4. Backend xử lý và phát event `UserTyping` (với `isTyping: true`) cho tất cả user khác trong phòng ngoại trừ User A.
5. **User B** nhận được `UserTyping`, hiển thị "User A đang gõ...".
6. **User A** dừng gõ quá 5s (backend tự expire) hoặc Frontend của User A gọi `SendTyping("conv-1", false)`.
7. Backend phát event `UserTyping` (với `isTyping: false`).
8. **User B** nhận được event, ẩn dòng "User A đang gõ...".
9. Khi User đóng chat, gọi `LeaveConversation("conv-1")` để dọn dẹp. Đảm bảo hiệu năng hệ thống.

---

**Lưu ý Đa thiết bị (Multi-tab/Multi-device):**
Tính năng này đã hỗ trợ multi-tab. Nếu User A mở 2 tab và gõ ở Tab 1, server sẽ báo cho User B là "User A đang gõ". Nếu Tab 1 ngừng gõ nhưng Tab 2 vẫn đang gõ, server sẽ chưa báo "Ngừng gõ" cho User B cho đến khi tất cả các tab của User A đều ngừng gõ. Frontend không cần phải xử lý logic phức tạp này, backend đã cover.
