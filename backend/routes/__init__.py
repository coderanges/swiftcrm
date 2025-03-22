from backend.routes.auth_routes import auth_bp
from backend.routes.contact_routes import contact_bp
from backend.routes.lead_routes import lead_bp
from backend.routes.order_routes import order_bp
from backend.routes.invoice_routes import invoice_bp
from backend.routes.receipt_routes import receipt_bp
from backend.routes.accounting_routes import accounting_bp

__all__ = [
    'auth_bp', 
    'contact_bp', 
    'lead_bp', 
    'order_bp', 
    'invoice_bp', 
    'receipt_bp', 
    'accounting_bp'
]
