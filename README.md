# Excel-Analytics-Platform-
A MERN stack app for uploading Excel files, parsing data, and generating interactive 2D/3D charts. Features include JWT-based auth, dashboards with upload history, downloadable graphs, and optional AI-powered insights. Built with React, Node, Express, MongoDB, Chart.js, and SheetJS.

# 📊 Excel Data Visualization Platform (MERN Stack)

A full-stack web application built using the **MERN (MongoDB, Express.js, React.js, Node.js)** stack that allows users to upload Excel files (`.xls` or `.xlsx`), analyze data, and generate interactive 2D/3D charts.  

This project is structured into **5-week development modules** and designed to give hands-on experience with complete MERN application development.

---

## 🚀 Features

- 🔐 **User & Admin Authentication** (JWT based)  
- 📂 **Excel File Upload & Parsing** (using `xlsx` or `SheetJS`)  
- 📊 **Graph Generation** with support for multiple chart types:  
  - Bar, Line, Pie, Scatter, 3D Column  
- 📈 **Data Mapping** – choose X and Y axes dynamically from uploaded data  
- 💾 **Dashboard with Upload History**  
- 📥 **Downloadable Charts** (PNG/PDF)  
- 🎨 **Simple & Modern Responsive UI** (Tailwind CSS)  
- 🤖 **AI Tools API Integration (Optional)** – Generate smart insights/summary reports  

---

## 🛠 Tech Stack

### Frontend
- React.js  
- Redux Toolkit  
- Chart.js  
- Three.js  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Multer (for file uploads)  
- SheetJS / xlsx (Excel parsing)  

### Tools
- Postman (API testing)  
- Git/GitHub  
- Cloudinary (optional, for file storage)  

### Optional
- OpenAI (or similar AI API) for summaries  

---

## 📅 Development Timeline

- **Week 1** → Project setup, user/admin authentication, dashboard layout  
- **Week 2** → File upload setup, Excel parsing logic, structured storage in MongoDB  
- **Week 3** → Chart rendering with Chart.js & Three.js, dynamic X/Y axis selection  
- **Week 4** → Save analysis history, enable download feature, AI API integration  
- **Week 5** → Final testing, deployment, and documentation  

---

## 📚 References
- [SheetJS Documentation](https://sheetjs.com/)  

---

## 🔧 How to Run Locally

```bash
# Clone repository
git clone https://github.com/your-username/excel-data-visualization.git
cd excel-data-visualization

# Install dependencies
npm install

# Run backend
cd backend
npm install
npm run dev

# Run frontend
cd frontend
npm install
npm start
