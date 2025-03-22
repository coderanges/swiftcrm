from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database.models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email already exists. Please login.', 'danger')
            return redirect(url_for('auth.login'))
        
        # Create new user
        new_user = User(
            name=name,
            email=email,
            password=generate_password_hash(password, method='pbkdf2:sha256')
        )
        
        # Add to database
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            flash('Please check your login details and try again.', 'danger')
            return redirect(url_for('auth.login'))
        
        # Login the user
        login_user(user, remember=remember)
        flash('Login successful!', 'success')
        
        # Redirect to the page the user was trying to access
        next_page = request.args.get('next')
        return redirect(next_page or url_for('index'))
    
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))

# API endpoints for future React integration
@auth_bp.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    
    # Validate data
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password'], method='pbkdf2:sha256')
    )
    
    # Add to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful!'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    
    # Validate data
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create a session for the user
    login_user(user)
    
    return jsonify({
        'message': 'Login successful!',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        }
    }), 200

@auth_bp.route('/api/logout', methods=['POST'])
def api_logout():
    logout_user()
    return jsonify({'message': 'Logout successful!'}), 200
