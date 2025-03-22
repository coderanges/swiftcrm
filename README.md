# **SwiftCRM**  

SwiftCRM is a comprehensive Customer Relationship Management (CRM) system with a Flask backend and React TypeScript frontend. It allows for easy management of **contacts, leads, orders, invoices, receipts, and accounting**. The project implements a modern architecture with a RESTful API backend and a responsive React frontend.

---

## **Features**  
✅ User Authentication (Login/Signup)  
✅ Contact Management (Add, Edit, Delete)  
✅ Lead Tracking and Management  
✅ Order Management (Create, Track, Update)  
✅ Invoicing System (Generate, Send, Track Payments)  
✅ Receipt Management (Generate and Track Receipts)  
✅ Accounting Module (Track Expenses, Revenue, and Financial Reports)  
✅ Modern React TypeScript Frontend  
✅ RESTful API with Flask Backend  
✅ Responsive Design for Mobile and Desktop  

---

## **📂 Project Structure**  
```
swiftcrm/
│── backend/                        # Flask Backend
│   ├── app.py                      # Main application file
│   ├── config.py                   # Configuration settings
│   ├── database/                   # Database models and setup
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── db_setup.py             # Database initialization
│   ├── routes/                     # API routes
│   │   ├── auth_routes.py          # Authentication endpoints
│   │   ├── contact_routes.py       # Contact management endpoints
│   │   ├── lead_routes.py          # Lead management endpoints
│   │   ├── order_routes.py         # Order management endpoints
│   │   ├── invoice_routes.py       # Invoice management endpoints
│   │   ├── receipt_routes.py       # Receipt management endpoints
│   │   ├── accounting_routes.py    # Accounting endpoints
│   ├── templates/                  # Jinja2 templates
│   │   ├── base.html               # Base template with layout
│   │   ├── index.html              # Dashboard template
│   │   ├── login.html              # Authentication templates
│   │   ├── ...                     # Other feature templates
│   ├── static/                     # Static assets
│       ├── css/style.css           # Custom CSS styles
│       ├── js/scripts.js           # Frontend JavaScript
│
│── frontend/                       # React TypeScript Frontend
│   ├── public/                     # Public assets
│   ├── src/                        # Source code
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # React context providers
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── App.tsx                 # Main application component
│   │   ├── index.tsx               # Entry point
│   ├── package.json                # Node.js dependencies
│   ├── tsconfig.json               # TypeScript configuration
│
│── venv/                           # Python virtual environment
│── requirements.txt                # Python dependencies
│── .gitignore                      # Git ignore file
│── README.md                       # Project documentation
```

---

## **🚀 Installation and Setup**  

### **Backend Setup**  

#### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/coderanges/swiftcrm.git
cd swiftcrm
```

#### **2️⃣ Create and Activate Virtual Environment**  
```bash
python3 -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)
```

#### **3️⃣ Install Backend Dependencies**  
```bash
pip install -r requirements.txt
```

#### **4️⃣ Set Up the Database**  
```bash
export PYTHONPATH=$PWD  # Set Python path to include the project root
cd backend
python -c "from backend.app import create_app; from backend.database.db_setup import setup_db; app = create_app(); setup_db(app)"
```

#### **5️⃣ Run the Backend Server**  
```bash
cd ..  # Return to project root if needed
export PYTHONPATH=$PWD
python -c "from backend.app import create_app; app = create_app(); app.run(debug=True, host='0.0.0.0')"
```
The backend API will be available at **http://localhost:5000/**  

### **Frontend Setup**  

#### **1️⃣ Navigate to the Frontend Directory**  
```bash
cd frontend
```

#### **2️⃣ Install Frontend Dependencies**  
```bash
npm install
```

#### **3️⃣ Start the Development Server**  
```bash
npm start
```

The React frontend will be available at **http://localhost:3000/**  

#### **4️⃣ Build for Production**  
```bash
npm run build
```

---

## **🌐 API Endpoints**  

### **Authentication**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register a new user |
| `/api/login` | POST | Log in an existing user |
| `/api/logout` | POST | Log out current user |

### **Contacts**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contacts` | GET | Get all contacts |
| `/api/contacts` | POST | Create a new contact |
| `/api/contacts/:id` | GET | Get contact details |
| `/api/contacts/:id` | PUT | Update a contact |
| `/api/contacts/:id` | DELETE | Delete a contact |

### **Leads**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | GET | Get all leads |
| `/api/leads` | POST | Create a new lead |
| `/api/leads/:id` | GET | Get lead details |
| `/api/leads/:id` | PUT | Update a lead |
| `/api/leads/:id` | DELETE | Delete a lead |

### **Orders**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | Get all orders |
| `/api/orders` | POST | Create a new order |
| `/api/orders/:id` | GET | Get order details |
| `/api/orders/:id` | PUT | Update an order |
| `/api/orders/:id` | DELETE | Delete an order |

### **Invoices**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invoices` | GET | Get all invoices |
| `/api/invoices` | POST | Create a new invoice |
| `/api/invoices/:id` | GET | Get invoice details |
| `/api/invoices/:id` | PUT | Update an invoice |
| `/api/invoices/:id` | DELETE | Delete an invoice |

### **Receipts**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/receipts` | GET | Get all receipts |
| `/api/receipts` | POST | Create a new receipt |
| `/api/receipts/:id` | GET | Get receipt details |
| `/api/receipts/:id` | PUT | Update a receipt |
| `/api/receipts/:id` | DELETE | Delete a receipt |

### **Accounting**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/accounting/entries` | GET | Get accounting entries |
| `/api/accounting/entries` | POST | Create a new accounting entry |
| `/api/accounting/summary` | GET | Get financial summary |

---

## **📱 Frontend Features**

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **TypeScript Support**: Type-safe code for better development experience
- **Component-Based Architecture**: Reusable UI components
- **Context API**: For state management across the application
- **Routing**: Page navigation with React Router
- **Form Validation**: Client-side validation for all forms
- **Authentication**: User login and registration with token-based auth
- **Secure API Communication**: Axios for API requests with proper error handling

---

## **🖥️ System Requirements**

### **Backend**
- Python 3.8+
- Flask 3.0.0
- SQLAlchemy 2.0+
- Additional requirements in requirements.txt

### **Frontend**
- Node.js 14.0+ (16.0+ recommended)
- npm 6.0+ or yarn
- React 18.0+
- TypeScript 4.9+

---

## **📈 Future Plans**  
- [ ] Implement role-based access control
- [ ] Add data visualization for accounting data
- [ ] Enable PDF generation for invoices and receipts
- [ ] Integrate with payment gateways
- [ ] Add email notifications for important events
- [ ] Implement advanced reporting and analytics
- [ ] Add dark/light theme support

---

## **📝 License**  
This project is licensed under the **MIT License**.  

---