# Ứng dụng Gia Phả Dòng Họ

Ứng dụng web hiển thị sơ đồ gia phả tương tác từ dữ liệu Google Sheets.

## Tính năng
- Hiển thị sơ đồ cây gia phả tương tác (Zoom, Pan).
- Tìm kiếm thành viên.
- Xem thông tin chi tiết thành viên.
- Xuất sơ đồ ra ảnh PNG hoặc PDF.
- Bảo mật bằng mật khẩu đơn giản.

## Cài đặt và Chạy ứng dụng

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd cay_gia_pha
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   - Tạo file `.env` từ file `.env.example` (hoặc tạo mới).
   - Điền các thông tin sau:
     ```
     VITE_PASSWORD=your_access_password
     # Dùng Google Apps Script làm API nguồn dữ liệu (khuyến nghị)
     VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxxxxxx/exec
     ```

4. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```

## Cấu trúc Google Sheet

## Dùng Google Apps Script làm Web App (tùy chọn)
1. Trong Google Apps Script, triển khai Web App:
   - Deploy > New deployment > Web app
   - Execute as: Me
   - Who has access: Anyone
2. Viết doGet() trả về JSON dạng values hoặc mảng object. Ví dụ:
   ```javascript
   function doGet() {
     const ss = SpreadsheetApp.openById('SPREADSHEET_ID');
     const sh = ss.getSheetByName('Sheet1');
     const values = sh.getRange('A1:I' + sh.getLastRow()).getValues();
     return ContentService.createTextOutput(JSON.stringify({ values }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Dán URL triển khai vào `VITE_APPS_SCRIPT_URL` trong `.env`, sau đó khởi động lại dev server.

Để ứng dụng hoạt động đúng, file Google Sheet cần có cấu trúc các cột như sau (Sheet1):

| Cột | Tên trường | Mô tả | Ví dụ |
|-----|------------|-------|-------|
| A | ID | Mã định danh duy nhất (bắt buộc) | `1`, `2`, `p1` |
| B | Họ tên đầy đủ | Tên hiển thị | `Nguyễn Văn A` |
| C | Ngày sinh | Định dạng văn bản | `01/01/1950` |
| D | Ngày mất | Định dạng văn bản (nếu có) | `01/01/2020` |
| E | Giới tính | `Nam` hoặc `Nữ` | `Nam` |
| F | ID cha/mẹ | ID của cha hoặc mẹ để liên kết (để trống nếu là gốc) | `1` |
| G | Cấp thế hệ | Số thứ tự thế hệ | `1`, `2` |
| H | Thông tin thêm | Ghi chú, nghề nghiệp, địa chỉ | `Tổ trưởng đời thứ 5` |
| I | ID vợ/chồng | ID của người phối ngẫu (tùy chọn) | `2` |

**Lưu ý:**
- Dòng đầu tiên của Sheet phải là tiêu đề cột.
- Dữ liệu bắt đầu từ dòng thứ 2.
- Sheet phải được chia sẻ quyền xem (Viewer) cho "Anyone with the link" hoặc chia sẻ riêng cho Service Account nếu dùng OAuth server-side (nhưng ứng dụng này dùng API Key nên cần công khai hoặc hạn chế theo domain).
- **Khuyến nghị:** Sử dụng API Key có giới hạn referrer (domain) để bảo mật.

### Mở rộng: Quan hệ hôn nhân nâng cao
- Nếu cần hỗ trợ nhiều hôn nhân/ly hôn/tái hôn, tạo Sheet “Hôn nhân” với các cột: `MarriageID`, `Spouse1ID`, `Spouse2ID`, `StartDate`, `EndDate`, `Ghi chú`.
- Mỗi dòng tương ứng một cuộc hôn nhân; một người có thể xuất hiện ở nhiều dòng khác nhau.
- Con cái vẫn liên kết qua “ID cha/mẹ” ở Sheet thành viên (có thể tách thành “ID cha”, “ID mẹ” nếu cần).

## Nguồn dữ liệu
- Mặc định ứng dụng đọc dữ liệu từ Google Apps Script Web App (`VITE_APPS_SCRIPT_URL`) trả về JSON.
- Không còn dùng trực tiếp Google Sheets API (sheets.googleapis.com) trong frontend.

## Triển khai (Deployment)

Ứng dụng có thể triển khai dễ dàng lên Vercel hoặc Netlify.

### Vercel
1. Cài đặt Vercel CLI hoặc kết nối GitHub với Vercel.
2. Import project.
3. Trong phần "Environment Variables", thêm các biến:
   - `VITE_GOOGLE_SHEETS_API_KEY`
   - `VITE_SPREADSHEET_ID`
   - `VITE_PASSWORD`
4. Deploy.

## Công nghệ sử dụng
- React
- TypeScript
- Vite
- Tailwind CSS
- React Flow (@xyflow/react)
- Dagre (Layout)
- Google Sheets API
