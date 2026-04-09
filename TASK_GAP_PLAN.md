# Task Gap Plan

Tai lieu nay duoc tong hop sau khi doi chieu repo hien tai voi file `Task con thieu.docx`.

## 1. Tong quan

### Da bo sung trong dot nay
- Frontend tour list da co phan trang va dong bo voi query `page`.
- Service layer da doc dung metadata `totalElements`, `totalPages`, `size`.
- Tour detail da xu ly tot hon du lieu ngay tu backend va bo sung khu vuc lich khoi hanh ro rang hon.
- Cart da co buoc yeu cau dang nhap user truoc khi dat tour.
- Da them trang `tai-khoan` cho user-side dang nhap/dang ky va quay lai gio hang sau khi xac thuc.
- Da them backend `GET /api/v1/order/my-orders` va `PUT /api/v1/order/{id}/cancel`.
- Da them frontend `Don hang cua toi` dung du lieu backend that va co the huy don.

### Van con can backend hoan thien
- API `GET /api/v1/order/admin?page=1&size=10`
- API `PUT /api/v1/order/{id}/status` voi request body:
  - `status`
  - `adminNote`
- Co che auth thuc su cho user:
  - token/session
  - xac dinh user hien tai o backend
  - phan quyen endpoint order user/admin

## 2. Doi chieu theo task

### Tour user
- Phan trang danh sach tour: `Done`
- Tour detail hien thi lich trinh: `Partial`
  - Frontend da xu ly render itinerary neu backend tra ve.
  - Neu backend chua tra `itinerary`, giao dien se hien ghi chu dot khoi hanh de tranh trang trong.
  - De hoan tat dung yeu cau, backend can tra `itinerary` day du.

### Tour admin
- Repo hien tai da co CRUD/admin pages co ban.
- Chua thay them task moi bat buoc trong file Word ngoai phan order lien quan admin.

### Order user
- Bat buoc dang nhap truoc khi dat tour: `Done o frontend`
- Quay lai quy trinh dat tour sau dang nhap: `Done o frontend`
- Danh sach don cua toi: `Done`
- Huy don user: `Done`

### Order admin
- Xem danh sach don trong admin: `Da co ban co ban`
- Dung dung contract moi (`/order/admin`, update status bang body): `Blocked by backend`

## 3. De xuat thu tu tiep theo

1. Nang cap backend auth user de tra token/session thuc su.
2. Them endpoint `my-orders` va `cancel order` cho user.
3. Them endpoint admin order theo dung contract moi va `adminNote`.
4. Tra `itinerary` day du trong API tour detail.
5. Sau khi backend xong, bo sung trang `Don hang cua toi` o frontend.
