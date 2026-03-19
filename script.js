// 1. Configuration - เปลี่ยน URL เป็น Endpoint จริงของคุณ
const API_BASE_URL = 'https://your-api-domain.com/api/v1';

/**
 * 2. Skeleton Loading
 * สร้างโครงร่างจำลองระหว่างรอข้อมูลจาก API
 */
function createSkeletons(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <div class="room-card skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line desc"></div>
                    <div class="skeleton-line btn"></div>
                </div>
            </div>`;
    }
}

/**
 * 3. Fetch & Render Dashboard
 * ดึงข้อมูลห้องทั้งหมดมาประมวลผลสรุปรายชั้น
 */
async function fetchRoomsData() {
    const statsContainer = document.getElementById('stats-container');
    const gridContainer = document.getElementById('rooms');
    const roomsSection = document.getElementById('rooms-section');
    
    // ล้างหน้าจอและแสดง Skeleton
    if (roomsSection) roomsSection.style.display = 'none';
    statsContainer.innerHTML = '<div class="skeleton-line" style="width:200px; height:30px;"></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        if (!response.ok) throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
        
        const rooms = await response.json();
        window.allRoomsData = rooms; // เก็บข้อมูลไว้ใน Global Variable เพื่อใช้กรองภายหลัง

        statsContainer.innerHTML = '';

        // นับจำนวนห้องว่างรายชั้น
        const summary = {};
        rooms.forEach(room => {
            if (room.status === 'available') {
                summary[room.floor] = (summary[room.floor] || 0) + 1;
            }
        });

        const floors = Object.keys(summary).sort().reverse();

        if (floors.length === 0) {
            statsContainer.innerHTML = '<p>ขออภัย ขณะนี้ไม่มีห้องว่าง</p>';
            return;
        }

        // สร้างปุ่มเลือกชั้นบน Dashboard
        floors.forEach(floor => {
            const btnCard = document.createElement('div');
            btnCard.className = 'stat-card hover-action';
            btnCard.style.cursor = 'pointer';
            btnCard.innerHTML = `
                <small style="color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Floor</small>
                <div style="font-size: 2rem; font-weight: 700; color: var(--accent-color);">${floor}</div>
                <p style="font-size: 0.9rem; margin-bottom: 15px;">ว่าง ${summary[floor]} ยูนิต</p>
                <span class="btn-view-small">ดูรายละเอียด</span>
            `;
            btnCard.onclick = () => renderFilteredRooms(floor);
            statsContainer.appendChild(btnCard);
        });

    } catch (error) {
        console.error('Error:', error);
        statsContainer.innerHTML = '<p style="color: #ff4d4d;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

/**
 * 4. Filter & Render Room Grid
 * แสดงรายการห้องพักเฉพาะชั้นที่เลือก
 */
function renderFilteredRooms(floor) {
    const gridContainer = document.getElementById('rooms');
    const roomsSection = document.getElementById('rooms-section');
    const title = document.getElementById('selected-floor-title');

    if (!window.allRoomsData) return;

    roomsSection.style.display = 'block';
    title.innerText = `ห้องพักว่างบนชั้น ${floor}`;
    gridContainer.innerHTML = '';

    // กรองข้อมูล (เฉพาะชั้นที่เลือก และสถานะต้อง Available)
    const filteredRooms = window.allRoomsData.filter(
        r => String(r.floor) === String(floor) && r.status === 'available'
    );

    filteredRooms.forEach((room, index) => {
        const card = `
            <div class="room-card" style="animation: fadeInUp 0.6s ease forwards ${index * 0.1}s; opacity: 0;">
                <div class="image-container">
                    <img src="${room.image_url}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Luxury+Room'">
                    <span class="price-tag">
                        <span class="pulse-dot"></span> ฿${Number(room.price).toLocaleString()}
                    </span>
                </div>
                <div class="content">
                    <h3>${room.name}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">
                        ห้องพักสไตล์ Ultra-Modern บนชั้น ${room.floor} พร้อมเข้าอยู่ได้ทันที
                    </p>
                    <button class="btn-select" onclick="goToBooking('${room.id}', '${room.name}')">จองห้องนี้</button>
                </div>
            </div>`;
        gridContainer.innerHTML += card;
    });

    // Smooth Scroll ไปยังส่วนแสดงห้องพัก
    roomsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 5. Booking Navigation
 */
function goToBooking(roomId, roomName) {
    const nameInput = document.getElementById('selected-room-name');
    const idInput = document.getElementById('selected-room-id');
    
    if(nameInput && idInput) {
        nameInput.value = roomName;
        idInput.value = roomId;
        document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * 6. Form Submission to API
 */
const bookingForm = document.getElementById('booking-form');
if(bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('.btn-submit');
        const messageDiv = document.getElementById('form-message');
        
        // รวบรวมข้อมูลจากฟอร์ม
        const bookingData = {
            room_id: document.getElementById('selected-room-id').value,
            customer_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            check_in_date: document.getElementById('date').value,
            password: document.getElementById('password').value
        };

        btn.disabled = true;
        btn.innerText = 'กำลังส่งข้อมูล...';
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) throw new Error('การส่งข้อมูลล้มเหลว');

            messageDiv.innerHTML = `
                <div style="margin-top:20px; padding:15px; background:rgba(0,242,255,0.1); border:1px solid var(--accent-color); border-radius:12px; color:var(--accent-color); text-align:center;">
                    ✨ ส่งคำขอจองสำเร็จ! เจ้าหน้าที่จะติดต่อกลับที่เบอร์ ${bookingData.phone}
                </div>`;
            bookingForm.reset();
            
        } catch (error) {
            messageDiv.innerHTML = `<p style="color: #ff4d4d; margin-top:15px;">❌ เกิดข้อผิดพลาด: ${error.message}</p>`;
        } finally {
            btn.disabled = false;
            btn.innerText = 'ยืนยันการจอง';
        }
    });
}

// เริ่มต้นโหลดข้อมูลเมื่อหน้าเว็บพร้อม
document.addEventListener('DOMContentLoaded', fetchRoomsData);