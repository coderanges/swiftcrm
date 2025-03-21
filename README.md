# **SwiftCRM**  

SwiftCRM is a simple Customer Relationship Management (CRM) system built with Flask and Jinja2 templates. It allows for easy management of **contacts, leads, orders, invoices, receipts, and accounting**. The project is designed to start with a Jinja2-based frontend and later transition to a React frontend while keeping the Flask backend.

---

## **Features**  
✅ User Authentication (Login/Signup)  
✅ Contact Management (Add, Edit, Delete)  
✅ Lead Tracking and Management  
✅ Order Management (Create, Track, Update)  
✅ Invoicing System (Generate, Send, Track Payments)  
✅ Receipt Management (Generate and Track Receipts)  
✅ Accounting Module (Track Expenses, Revenue, and Financial Reports)  
✅ Jinja2-based UI (for now, React-ready)  
✅ API Endpoints for future React integration  

---

## **📂 Project Structure**  
```
swiftcrm/
│── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── database/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── db_setup.py
│   │   ├── migrations/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── contact_routes.py
│   │   ├── lead_routes.py
│   │   ├── order_routes.py
│   │   ├── invoice_routes.py
│   │   ├── receipt_routes.py
│   │   ├── accounting_routes.py
│   ├── templates/
│   │   ├── base.html
│   │   ├── index.html
│   │   ├── contacts.html
│   │   ├── leads.html
│   │   ├── orders.html
│   │   ├── invoices.html
│   │   ├── receipts.html
│   │   ├── accounting.html
│   │   ├── login.html
│   ├── static/
│   │   ├── css/style.css
│   │   ├── js/scripts.js
│── frontend/ (For React when migrating)
│── docker-compose.yml
│── README.md
```

---

## **🚀 Installation**  

### **1️⃣ Clone the Repository**  
```bash
git clone git@github.com:coderanges/swiftcrm.git
cd swiftcrm/backend
```

### **2️⃣ Create and Activate Virtual Environment**  
```bash
python3 -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)
```

### **3️⃣ Install Dependencies**  
```bash
pip install -r requirements.txt
```

### **4️⃣ Set Up the Database**  
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### **5️⃣ Run the App**  
```bash
flask run
```
The app will be available at **http://127.0.0.1:5000/**  

---

## **📂 Creating the Project Structure**  

### **Run these commands inside your `swiftcrm` folder:**  

```bash
# Create backend and frontend directories
mkdir -p backend/database backend/database/migrations backend/routes backend/templates backend/static/css backend/static/js frontend

cd backend

# Create main backend files
touch app.py config.py requirements.txt

# Create database files
touch database/__init__.py database/models.py database/db_setup.py

# Create route files
touch routes/__init__.py routes/auth_routes.py routes/contact_routes.py routes/lead_routes.py routes/order_routes.py routes/invoice_routes.py routes/receipt_routes.py routes/accounting_routes.py

# Create template files
touch templates/base.html templates/index.html templates/contacts.html templates/leads.html templates/orders.html templates/invoices.html templates/receipts.html templates/accounting.html templates/login.html

# Create static files
touch static/css/style.css static/js/scripts.js

# Navigate back to project root
cd ../..

# Create Docker and README files
touch docker-compose.yml README.md
```

---

## **📌 API Endpoints (For Future React Migration)**  

| Endpoint          | Method | Description |
|------------------|--------|-------------|
| `/`              | GET    | Home page (Jinja2) |
| `/contacts`      | GET    | Contact list (Jinja2) |
| `/leads`         | GET    | Lead list (Jinja2) |
| `/orders`        | GET    | Order list (Jinja2) |
| `/invoices`      | GET    | Invoice list (Jinja2) |
| `/receipts`      | GET    | Receipt list (Jinja2) |
| `/accounting`    | GET    | Accounting dashboard (Jinja2) |
| `/api/contacts`  | GET    | Fetch contacts (JSON API) |
| `/api/leads`     | GET    | Fetch leads (JSON API) |
| `/api/orders`    | GET    | Fetch orders (JSON API) |
| `/api/invoices`  | GET    | Fetch invoices (JSON API) |
| `/api/receipts`  | GET    | Fetch receipts (JSON API) |
| `/api/accounting`| GET    | Fetch financial reports (JSON API) |

---

## **📈 Future Plans**  
- [ ] Integrate React for frontend  
- [ ] Add authentication with JWT  
- [ ] Implement role-based access control  
- [ ] Enhance invoicing and receipt system with payment tracking  
- [ ] Expand accounting module with budgeting and tax calculations  

---

## **📝 License**  
This project is licensed under the **MIT License**.  

---