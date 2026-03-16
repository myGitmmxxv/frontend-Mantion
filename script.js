// 1. ตั้งค่า URL ของ API 
const API_BASE_URL = 'https://your-api-domain.com/api/v1';

// 2. ฟังก์ชันดึงข้อมูลหน้า Hero
async function fetchLandingData() {
    try {
        const response = await fetch(`${API_BASE_URL}/landing`);
        const data = await response.json();
        document.getElementById('hero-title').innerText = data.title;
        document.getElementById('hero-desc').innerText = data.description;
    } catch (error) {
        console.error('Error fetching landing data:', error);
    }
}

// 3. ฟังก์ชันดึงข้อมูลและจัดการ Dashboard + Room Grid
async function fetchRoomsData() {
    const statsContainer = document.getElementById('stats-container');
    const gridContainer = document.getElementById('rooms');
    
    statsContainer.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';
    gridContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const rooms = await response.json(); // สมมติว่าใน object room มี floor และ status
        
        // --- ส่วน Dashboard สรุป ---
        const summary = {};
        const availableRooms = rooms.filter(r => r.status === 'available');

        // นับห้องว่างรายชั้น
        availableRooms.forEach(room => {
            summary[room.floor] = (summary[room.floor] || 0) + 1;
        });

        statsContainer.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const count = summary[i] || 0;
            const text = count > 0 ? `ว่าง ${count} ห้อง` : 'ไม่มีห้องว่าง';
            statsContainer.innerHTML += `<div class="stat-card">ชั้น ${i}: ${text}</div>`;
        }

        // --- ส่วนแสดงรายการห้อง (เฉพาะที่ว่าง) ---
        if (availableRooms.length === 0) {
            gridContainer.innerHTML = '<p>ขออภัย ไม่มีห้องว่างในขณะนี้</p>';
            return;
        }

        availableRooms.forEach(room => {
            const card = `
                <div class="room-card">
                    <div class="image-container">
                        <img src="${room.image_url}" alt="${room.name}">
                        <span class="price-tag">฿${room.price.toLocaleString()} / คืน</span>
                    </div>
                    <div class="content">
                        <h3>ชั้น ${room.floor} - ห้อง ${room.room_number}</h3>
                        <p>${room.name}</p>
                        <button class="btn-select" onclick="goToBooking('${room.id}', '${room.name}')">เลือกห้องนี้</button>
                    </div>
                </div>
            `;
            gridContainer.innerHTML += card;
        });

    } catch (error) {
        console.error('Error:', error);
        statsContainer.innerHTML = '<p>ไม่สามารถโหลดข้อมูลได้</p>';
    }
}

// 4. ฟังก์ชันสำหรับปุ่ม "เลือกห้องนี้"
function goToBooking(roomId, roomName) {
    document.getElementById('selected-room-name').value = roomName;
    document.getElementById('selected-room-id').value = roomId;
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
}

// 5. การจัดการฟอร์ม (Submit)
const bookingForm = document.getElementById('booking-form');
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = document.getElementById('selected-room-id').value;
    if (!roomId) { alert('กรุณาเลือกห้องพักก่อนครับ'); return; }

    const messageDiv = document.getElementById('form-message');
    messageDiv.innerText = 'กำลังส่งข้อมูล...';

    // จำลองการส่งข้อมูล
    await new Promise(resolve => setTimeout(resolve, 1000));
    messageDiv.style.color = '#4CAF50';
    messageDiv.innerText = 'จองสำเร็จ!';
    bookingForm.reset();
    document.getElementById('selected-room-id').value = '';
    document.getElementById('selected-room-name').value = '';
});

// 6. รันฟังก์ชันเมื่อโหลดหน้าเว็บ
window.onload = () => {
    fetchLandingData();
    fetchRoomsData();
};