import os
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, current_user
from dotenv import load_dotenv
from flask_cors import CORS
from backend.database.db_setup import setup_db
from backend.database.models import User
from backend.routes import auth_bp, contact_bp, lead_bp, order_bp, invoice_bp, receipt_bp, accounting_bp
from backend.config import config

# Load environment variables
load_dotenv()

def create_app(config_name='default'):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure the app
    app.config.from_object(config[config_name])
    
    # Set up CORS
    CORS(app, 
         supports_credentials=True, 
         resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Access-Control-Allow-Origin"]
    )
    
    # Add CORS headers to every response
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Set up the database
    db = setup_db(app)
    
    # Set up Flask-Login
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(lead_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(invoice_bp)
    app.register_blueprint(receipt_bp)
    app.register_blueprint(accounting_bp)
    
    # Home route
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return render_template('index.html')
        return redirect(url_for('auth.login'))
    
    return app

if __name__ == '__main__':
    app = create_app(os.environ.get('FLASK_CONFIG', 'development'))
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5002)), debug=app.config['DEBUG'])
