// 1. Mock Data - ข้อมูลจำลองสำหรับทดสอบ UI
const mockRooms = [
    { id: '901', name: 'Elite Penthouse', floor: '9', price: 35000, status: 'available', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
    { id: '801', name: 'Skyline Suite', floor: '8', price: 28500, status: 'available', image_url: 'https://images.unsplash.com/photo-1616486386502-27af5241d32e?auto=format&fit=crop&w=800&q=80' },
    { id: '701', name: 'Onyx Studio', floor: '7', price: 15000, status: 'available', image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
    { id: '601', name: 'Cyber Living', floor: '6', price: 16500, status: 'occupied', image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
    { id: '501', name: 'Midnight Corner', floor: '5', price: 14000, status: 'available', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
    { id: '401', name: 'Neon Loft', floor: '4', price: 19000, status: 'available', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80' },
    { id: '301', name: 'Midnight Corner2', floor: '3', price: 14000, status: 'available', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
    { id: '201', name: 'Midnight Corner', floor: '2', price: 14000, status: 'available', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
    { id: '101', name: 'Midnight Corner8', floor: '1', price: 14000, status: 'available', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },
    { id: '001', name: 'Midnight Corner9', floor: '0', price: 14000, status: 'available', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' },

];

// 2. ฟังก์ชันสร้าง Skeleton Loading (โครงร่างจำลอง)
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

// ... (คงส่วน mockRooms และ createSkeletons ไว้เหมือนเดิม) ...

async function fetchRoomsData() {
    const statsContainer = document.getElementById('stats-container');
    const gridContainer = document.getElementById('rooms');
    
    statsContainer.innerHTML = '<div class="skeleton-line" style="width:200px; height:30px;"></div>';

    await new Promise(resolve => setTimeout(resolve, 800)); // ลด Delay ลงนิดหน่อยให้ดูเร็วขึ้น
    statsContainer.innerHTML = '';

    // 1. นับจำนวนห้องว่างรายชั้น
    const summary = {};
    mockRooms.forEach(room => {
        if (room.status === 'available') {
            summary[room.floor] = (summary[room.floor] || 0) + 1;
        }
    });

    // 2. สร้าง Dashboard ปุ่มกดเลือกชั้น
    Object.keys(summary).sort().reverse().forEach(floor => {
        const btnCard = document.createElement('div');
        btnCard.className = 'stat-card hover-action'; // เพิ่ม class สำหรับจูงใจให้กด
        btnCard.style.cursor = 'pointer';
        btnCard.innerHTML = `
            <small style="color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Floor</small>
            <div style="font-size: 2rem; font-weight: 700; color: var(--accent-color);">${floor}</div>
            <p style="font-size: 0.9rem; margin-bottom: 15px;">ว่าง ${summary[floor]} ยูนิต</p>
            <span class="btn-view-small">ดูรายละเอียด</span>
        `;
        
        // เมื่อคลิกที่บัตรชั้น
        btnCard.onclick = () => filterRoomsByFloor(floor);
        statsContainer.appendChild(btnCard);
    });
}

// 3. ฟังก์ชันกรองห้องพักตามชั้น
function filterRoomsByFloor(floor) {
    const gridContainer = document.getElementById('rooms');
    const roomsSection = document.getElementById('rooms-section');
    const title = document.getElementById('selected-floor-title');

    // แสดง Section ห้องพัก
    roomsSection.style.display = 'block';
    title.innerText = `ห้องพักว่างบนชั้น ${floor}`;
    gridContainer.innerHTML = '';

    // กรองข้อมูลเฉพาะชั้นที่เลือก และสถานะต้องว่าง
    const filteredRooms = mockRooms.filter(r => r.floor === floor && r.status === 'available');

    filteredRooms.forEach((room, index) => {
        const card = `
            <div class="room-card" style="animation: fadeInUp 0.6s ease forwards ${index * 0.1}s; opacity: 0;">
                <div class="image-container">
                    <img src="${room.image_url}" alt="${room.name}">
                    <span class="price-tag"><span class="pulse-dot"></span> ฿${room.price.toLocaleString()}</span>
                </div>
                <div class="content">
                    <h3>${room.name}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px;">สัมผัสความหรูหราบนชั้น ${room.floor}</p>
                    <button class="btn-select" onclick="goToBooking('${room.id}', '${room.name}')">จองห้องนี้</button>
                </div>
            </div>`;
        gridContainer.innerHTML += card;
    });

    // เลื่อนหน้าจอลงไปดูห้องที่กรองแล้ว
    roomsSection.scrollIntoView({ behavior: 'smooth' });
}

// ... (คงส่วน goToBooking และฟังก์ชันอื่นๆ ไว้) ...

// 4. ฟังก์ชันสำหรับการจอง (Smooth Navigation)
function goToBooking(roomId, roomName) {
    const nameInput = document.getElementById('selected-room-name');
    const idInput = document.getElementById('selected-room-id');
    
    if(nameInput && idInput) {
        nameInput.value = roomName;
        idInput.value = roomId;
        document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. การจัดการฟอร์ม Submit
const bookingForm = document.getElementById('booking-form');
if(bookingForm) {
    // ในส่วน bookingForm.addEventListener('submit', ...)
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
    // ดึงค่าใหม่ที่เพิ่มเข้ามา
        const formData = {
            roomId: document.getElementById('selected-room-id').value,
            roomName: document.getElementById('selected-room-name').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value, // ดึงเบอร์โทร
            date: document.getElementById('date').value,
            password: document.getElementById('password').value // ดึงรหัสผ่าน
        };

        const btn = e.target.querySelector('.btn-submit');
        const messageDiv = document.getElementById('form-message');
    
        btn.disabled = true;
        btn.innerText = 'กำลังบันทึกข้อมูล...';

    // จำลองการส่งข้อมูล (Mock API)
        console.log("ส่งข้อมูลการจอง:", formData); 
        await new Promise(resolve => setTimeout(resolve, 2000));

        messageDiv.innerHTML = `
            <div style="margin-top:20px; padding:20px; background:rgba(0,242,255,0.1); border:1px solid var(--accent-color); border-radius:15px; color:var(--accent-color); text-align:center;">
                <div style="font-size: 1.2rem; margin-bottom: 5px;">✨ จองสำเร็จ!</div>
                เราได้ส่งรายละเอียดไปที่ ${formData.email} และเบอร์ ${formData.phone} แล้ว
            </div>`;
    
        btn.disabled = false;
        btn.innerText = 'ยืนยันการจอง';
        bookingForm.reset();
    });
}

// เริ่มต้นทำงาน
document.addEventListener('DOMContentLoaded', fetchRoomsData);