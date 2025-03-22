from .auth_routes import auth_bp
from .contact_routes import contact_bp
from .lead_routes import lead_bp
from .order_routes import order_bp
from .invoice_routes import invoice_bp
from .receipt_routes import receipt_bp
from .accounting_routes import accounting_bp

__all__ = [
    'auth_bp', 
    'contact_bp', 
    'lead_bp', 
    'order_bp', 
    'invoice_bp', 
    'receipt_bp', 
    'accounting_bp'
]
