// 1. ตั้งค่า URL ของ API 
const API_BASE_URL = '/api/v1';

// 2. ฟังก์ชันดึงข้อมูลหน้า Hero (Landing)
async function fetchLandingData() {
    try {
        const response = await fetch(`${API_BASE_URL}/landing`);
        const result = await response.json();
        
        // ดึงข้อมูล title และ description จากข้อมูล API
        const data = result.data ? result.data.hotel : result;
        const title = data.name || data.title || 'ค้นพบที่พักที่ตอบโจทย์ไลฟ์สไตล์คุณ';
        const description = data.description || data.tagline || 'สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับ';

        document.getElementById('hero-title').innerText = title;
        document.getElementById('hero-desc').innerText = description;
    } catch (error) {
        console.error('Error fetching landing data:', error);
    }
}

// 3. ฟังก์ชันดึงข้อมูลห้องพัก (Rooms) และ Loop สร้าง Card
async function fetchRoomsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const json = await response.json();
        // รองรับกรณีที่ API คืนค่าเป็น object { data: [...] } หรือคืนค่าเป็น array โดยตรง
        const rooms = json.data ? json.data : json;
        const gridContainer = document.getElementById('rooms');
        gridContainer.innerHTML = '';

        // รายการรูปภาพ Unsplash สวยๆ เพื่อมาแทนรูปที่ไม่มี
        const defaultImages = [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ];

        rooms.forEach((room, index) => {
            // เลือกรุป ถ้าไม่มีให้ใช้จาก Unsplash
            const imageUrl = room.image_url || (room.images && room.images[0]) || defaultImages[index % defaultImages.length];
            
            const card = `
                <div class="room-card">
                    <div class="image-container">
                        <img src="${imageUrl}" alt="${room.name}">
                        <span class="price-tag">฿${room.price.toLocaleString()} / คืน</span>
                    </div>
                    <div class="content">
                        <h3>${room.name}</h3>
                        <div class="amenities">
                            ${(room.amenities || []).slice(0, 3).map(item => `<span>${item}</span>`).join('')}
                        </div>
                        <button class="btn-select" onclick="goToBooking('${room.id || room._id}', '${room.name}')">เลือกห้องนี้</button>
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
let selectedRoomId = "rm-001"; // ค่าเริ่มต้น
function goToBooking(roomId, roomName) {
    selectedRoomId = roomId;
    console.log("เลือกห้อง:", selectedRoomId, roomName);
    
    // แสดงชื่อห้องที่เลือกลงในฟอร์ม
    const displayDiv = document.getElementById('selected-room-display');
    const nameSpan = document.getElementById('selected-room-name');
    if (displayDiv && nameSpan && roomName) {
        displayDiv.style.display = 'block';
        nameSpan.innerText = roomName;
    }

    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. การจัดการฟอร์ม (Submit)
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const checkInDate = document.getElementById('date').value;
        // จำลองวัน check-out เป็นวันถัดไป
        const checkOutDate = new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const bookingData = {
            roomId: selectedRoomId,
            guestName: document.getElementById('name').value,
            guestEmail: document.getElementById('email').value,
            checkIn: checkInDate,
            checkOut: checkOutDate
        };

        const messageDiv = document.getElementById('form-message');
        messageDiv.innerText = 'กำลังส่งข้อมูล...';
        messageDiv.style.color = '#fff';

        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.style.color = '#4CAF50';
                messageDiv.innerText = `จองเรียบร้อยแล้ว! รหัสอ้างอิงของคุณคือ: ${result.data.reference}`;
                bookingForm.reset();
            } else {
                messageDiv.style.color = '#FF5252';
                messageDiv.innerText = `จองไม่สำเร็จ: ${result.message}`;
            }
        } catch (error) {
            console.error('Booking Error:', error);
            messageDiv.style.color = '#FF5252';
            messageDiv.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
        }
    });
}

// 6. ฟังก์ชันจัดการข้อมูลแผนผังอาคาร (Building Map)
async function fetchBuildingData() {
    try {
        const response = await fetch(`${API_BASE_URL}/building`);
        const result = await response.json();
        const buildingContainer = document.getElementById('building-container');
        
        if (!buildingContainer) return;
        buildingContainer.innerHTML = '';

        result.data.forEach((floorData, index) => {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor-layer';
            floorDiv.innerHTML = `
                <span class="floor-num">${floorData.floor}</span>
                <span class="floor-label">${floorData.name}</span>
            `;
            
            // เมื่อเมาส์ "ชี้" (Hover) ไปที่ชั้น
            floorDiv.onmouseenter = () => {
                // แสดงผังห้องในชั้นนั้นทันที
                renderFloorPlan(floorData);
            };
            
            // เมื่อคลิก (Click) ยังคงเลื่อนหน้าจอลงไปจองได้
            floorDiv.onclick = () => {
                renderFloorPlan(floorData);
            };
            
            buildingContainer.appendChild(floorDiv);

            // เลือกชั้นบนสุดเป็นค่าเริ่มต้น
            if (index === 0) {
                renderFloorPlan(floorData);
            }
        });
    } catch (error) {
        console.error('Error fetching building data:', error);
    }
}

function renderFloorPlan(floorData) {
    const detailPanel = document.getElementById('floor-detail');
    const floorPlan = document.getElementById('floor-plan');
    const floorTitle = document.getElementById('current-floor-name');
    
    // 1. เริ่มเอฟเฟกต์การซ่อน (Fade-out)
    detailPanel.classList.remove('active-view');
    
    // 2. รอจังหวะสั้นๆ (Premium Delay) เพื่อเปลี่ยนข้อมูล
    setTimeout(() => {
        floorTitle.innerText = `Floor ${floorData.floor}: ${floorData.name}`;
        floorPlan.innerHTML = '';

        floorData.rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = `room-block ${room.status.toLowerCase()}`;
            
            roomDiv.innerHTML = `
                <div class="room-id">Room ${room.id}</div>
                <div class="room-status">Available</div>
            `;
            
            roomDiv.onclick = () => goToBooking(room.id, `Room ${room.id} (${floorData.name})`);
            floorPlan.appendChild(roomDiv);
        });

        // 3. เริ่มเอฟเฟกต์การแสดงผล (Fade-in) แบบนุ่มนวล
        requestAnimationFrame(() => {
            detailPanel.classList.add('active-view');
        });
    }, 150); // ดีเลย์เล็กน้อยเพื่อให้ดูนุ่มลึกขึ้น
}

// 7. รันฟังก์ชันเมื่อโหลดหน้าเว็บ
window.onload = () => {
    fetchLandingData();
    fetchRoomsData();
    fetchBuildingData(); // รันระบบแผนผังอาคาร
};
