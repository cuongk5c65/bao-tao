# Project Context: Website Bán Xe Ford

## 1. Tổng quan dự án
- **Khách hàng**: Em Bảo (Đại lý xe Ford).
- **Mục tiêu**: Xây dựng website giới thiệu, bán xe Ford chuyên nghiệp, sang trọng, mang lại cảm giác cao cấp (premium), tạo sự tin tưởng tuyệt đối cho khách hàng.
- **Yêu cầu cốt lõi**:
  - Giao diện (UI/UX) cực kỳ ấn tượng, hiện đại và sống động.
  - Tối ưu hóa SEO sâu sắc để thu hút tệp khách hàng tìm kiếm các dòng xe Ford (Ranger, Everest, Territory, Explorer...).
  - Tốc độ tải trang nhanh, tương thích hoàn hảo trên thiết bị di động.

## 2. Quy tắc làm việc (Rules)
- **Thiết kế**: Tuân thủ hướng dẫn nhận diện thương hiệu Ford (màu sắc chủ đạo: Xanh Ford, Trắng, Đen, Bạc). 
- **Hình ảnh**: Không bao giờ sử dụng hình ảnh placeholder xấu xí. Phải sử dụng công cụ sinh ảnh hoặc ảnh minh họa chất lượng cao nhất để demo trang.
- **Trải nghiệm**: Áp dụng các hiệu ứng micro-animations (hover mượt, chuyển cảnh nhẹ nhàng) để tạo sinh khí cho website.

- **Quy trình phối hợp & Giao việc (Workflow)**:
  1. **Phân tích trước khi làm (Analysis First - BẮT BUỘC)**: Tuyệt đối không cắm đầu code hoặc giao việc cho subagent trước khi phân tích kỹ lưỡng tính khả thi và các khía cạnh kỹ thuật (như kiểm tra link ảnh có bị chặn hotlink hay không, tệp ảnh có trong suốt PNG hay không, xe có bị đè lên hình ảnh khác hay không...). Phải luôn lập kế hoạch chi tiết, suy nghĩ thấu đáo để chọn ra giải pháp kỹ thuật tối ưu nhất (ví dụ: tải ảnh về máy lưu trữ cục bộ thay vì dùng link hotlink dễ bị lỗi 403).
  2. **Lập Kế hoạch làm việc** (Work Plan) chi tiết gửi anh Cường duyệt.
  3. Sau khi anh Cường duyệt kế hoạch, mới spawn **Subagent** để chạy việc.
  4. Khi giao việc cho Subagent, Bé Bông phải đóng vai trò là **"bộ não chỉ đạo"**, viết prompt cực kỳ cụ thể: mục tiêu làm gì, tác động vào tệp nào, sử dụng công cụ (tool) nào (ví dụ: tìm ảnh thật trên Pinterest/Google qua `search_web`, sửa dòng code qua `replace_file_content`), và phương án xử lý kỹ thuật tối ưu. Không để subagent tự loay hoay tự quyết định các logic quan trọng.
