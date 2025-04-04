# 🏠 Mental Health & Grievance Portal for Ladies Hostel

## 📌 Overview
This project is designed to provide a comprehensive platform for students in the ladies' hostel to log complaints, grievances, and mental health concerns. The system features two distinct interfaces:

- **User Interface**: Allows hostel residents to submit complaints related to rooms, cleanliness, roommates, or any other concerns. Additionally, users can log mental health complaints, book a slot, and choose their preferred counselor.
- **Admin Interface**: Enables hostel authorities to access and manage complaints, logs, and counselor selections using their unique registration number.

All user data is securely stored in the backend, ensuring privacy and efficient complaint resolution.

## 🛠️ Tech Stack
### **Frontend**
- [Next.js](https://nextjs.org/) – React-based framework for building a fast and efficient UI
- [Zustand](https://github.com/pmndrs/zustand) – State management for handling global state
- [shadcn/ui](https://ui.shadcn.com/) – UI components for a modern and elegant design
- [Axios](https://axios-http.com/) – API calls and data fetching

### **Backend** (Choose one)
- [Go Fiber](https://gofiber.io/) – Fast and lightweight web framework in Go
- [Express.js](https://expressjs.com/) – Lightweight Node.js framework for handling backend operations

## ✨ Features
### **User Side**
✅ Log complaints regarding hostel rooms, cleanliness, roommates, and other grievances.  
✅ Submit mental health concerns and request counseling.  
✅ Book slots and select a preferred counselor.  
✅ Secure storage of user complaints and requests in the backend.

### **Admin Side**
✅ Access all complaints, logs, and mental health session bookings.  
✅ View and manage counselor selections.  
✅ Authenticate using a unique registration number.

## 🚀 Installation & Setup
### **Prerequisites**
- Node.js & npm (for frontend and Express backend)
- Go (if using Fiber backend)
- A database (PostgreSQL/MySQL/MongoDB, depending on preference)

### **Clone the Repository**
```bash
git clone https://github.com/your-username/mental-health-WebApp.git
cd mental-health-WebApp
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **Backend Setup (Go Fiber)**
```bash
cd backend-go
go mod tidy
go run main.go
```

### **Backend Setup (Node.js Express)**
```bash
cd backend-node
npm install
npm start
```

## 🛡️ Security & Privacy
- All user data is encrypted and securely stored.
- Authentication and role-based access control for users and admins.
- Only authorized admins can access complaint logs and counselor bookings.

## 📌 Contributing
Contributions are welcome! Feel free to fork the repo, create a branch, and submit a pull request.

## 📜 License
This project is licensed under the MIT License.

## 📬 Contact
For any queries or suggestions, reach out to **your-email@example.com**.
