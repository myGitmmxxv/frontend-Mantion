// 1. ตั้งค่า URL ของ API 
const API_BASE_URL = 'https://your-api-domain.com/api/v1';

// 2. ฟังก์ชันดึงข้อมูลหน้า Hero (Landing)
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

// 3. ฟังก์ชันดึงข้อมูลห้องพัก (Rooms) และ Loop สร้าง Card
async function fetchRoomsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const rooms = await response.json();
        const gridContainer = document.getElementById('rooms');
        gridContainer.innerHTML = '';

        rooms.forEach(room => {
            const card = `
                <div class="room-card">
                    <div class="image-container">
                        <img src="${room.image_url}" alt="${room.name}">
                        <span class="price-tag">฿${room.price.toLocaleString()} / คืน</span>
                    </div>
                    <div class="content">
                        <h3>${room.name}</h3>
                        <div class="amenities">
                            ${room.amenities.map(item => `<span>${item}</span>`).join('')}
                        </div>
                        <button class="btn-select" onclick="goToBooking('${room.id}')">เลือกห้องนี้</button>
                    </div>
                </div>
            `;
            gridContainer.innerHTML += card;
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        document.getElementById('rooms').innerHTML = '<p>ขออภัย ไม่สามารถดึงข้อมูลห้องพักได้ในขณะนี้</p>';
    }
}

// 4. ฟังก์ชันจัดการการจอง
function goToBooking(roomId) {
    window.location.href = '#booking-section';
}

// 5. การจัดการฟอร์ม (Submit)
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const bookingData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value
        };

        console.log('กำลังจะส่งข้อมูลไปที่ API:', JSON.stringify(bookingData, null, 2));

        const messageDiv = document.getElementById('form-message');
        messageDiv.innerText = 'กำลังส่งข้อมูล...';

        try {
            // จำลองการส่งข้อมูล (ใส่ Code จริงของคุณที่นี่)
            setTimeout(() => {
                messageDiv.style.color = '#4CAF50';
                messageDiv.innerText = 'จองเรียบร้อยแล้ว!';
                bookingForm.reset();
            }, 1000);
        } catch (error) {
            messageDiv.style.color = '#FF5252';
            messageDiv.innerText = 'เกิดข้อผิดพลาด';
        }
    });
}

// 6. รันฟังก์ชันเมื่อโหลดหน้าเว็บ
window.onload = () => {
    fetchLandingData();
    fetchRoomsData();
};