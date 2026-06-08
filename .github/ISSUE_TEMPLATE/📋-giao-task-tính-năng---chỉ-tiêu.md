---
name: "\U0001F4CB Giao Task Tính Năng / Chỉ Tiêu"
about: Dùng khi cần giao task nghiệp vụ hoặc cấu trúc chỉ tiêu dữ liệu mới.
title: "[FEATURE] -"
labels: ''
assignees: ''

---

### 1. Mô tả chung
- **Business Meaning:** *[Người dùng hiểu chỉ tiêu này là gì?]*
- **UI/UX:** *[Dùng Claude để generate ra link/hình ảnh/code vào đây]*
- **Hiển thị mặc định (Default):** *[Mô tả hiển thị default ntn? (sort theo thời gian, amount, ...)]*
- **Bộ lọc & Tìm kiếm (Filter/Search):** *[Lưu ý mô tả thêm về logic AND - OR khi filter]*

---

### 2. Chi tiết Nhóm thông tin (Cột | Chỉ tiêu dữ liệu)

| Mục đích | Định nghĩa / Quy tắc |
| :--- | :--- |
| **Business Meaning** | Giải thích cột dữ liệu \| chỉ tiêu trên dash |
| **Technical Definition** | Dev hiểu dữ liệu lấy từ đâu (DB, Table, API...) |
| **Validation** | Ví dụ input/output mẫu |
| **Formula / Expression** | Công thức tính |
| **Missing Data Rule** | Nếu thiếu dữ liệu thì xử lý sao? |
| **Time Scope** | Mô tả về thời gian (Ngày, tháng, quý, năm...) |
| **Edge Cases** | Các trường hợp đặc biệt |
| **Exception Rule** | Lỗi tính toán xử lý thế nào, lỗi hiển thị sẽ như thế nào? |

---
### 3. Checklist cho Developer
- [ ] Đã hiểu rõ Business Logic
- [ ] Đã làm rõ Technical Definition (Database/API)
- [ ] Đã cover hết các Edge Cases
