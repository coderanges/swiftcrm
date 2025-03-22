from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, Contact

contact_bp = Blueprint('contacts', __name__)

# Web routes (Jinja2 templates)
@contact_bp.route('/contacts')
@login_required
def contacts():
    user_contacts = Contact.query.filter_by(user_id=current_user.id).all()
    return render_template('contacts.html', contacts=user_contacts)

@contact_bp.route('/contacts/add', methods=['GET', 'POST'])
@login_required
def add_contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        company = request.form.get('company')
        address = request.form.get('address')
        notes = request.form.get('notes')
        
        if not name:
            flash('Name is required!', 'danger')
            return redirect(url_for('contacts.add_contact'))
            
        new_contact = Contact(
            name=name,
            email=email,
            phone=phone,
            company=company,
            address=address,
            notes=notes,
            user_id=current_user.id
        )
        
        db.session.add(new_contact)
        db.session.commit()
        
        flash('Contact added successfully!', 'success')
        return redirect(url_for('contacts.contacts'))
        
    return render_template('add_contact.html')

@contact_bp.route('/contacts/<int:contact_id>')
@login_required
def view_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    return render_template('view_contact.html', contact=contact)

@contact_bp.route('/contacts/<int:contact_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    
    if request.method == 'POST':
        contact.name = request.form.get('name')
        contact.email = request.form.get('email')
        contact.phone = request.form.get('phone')
        contact.company = request.form.get('company')
        contact.address = request.form.get('address')
        contact.notes = request.form.get('notes')
        
        db.session.commit()
        
        flash('Contact updated successfully!', 'success')
        return redirect(url_for('contacts.view_contact', contact_id=contact.id))
        
    return render_template('edit_contact.html', contact=contact)

@contact_bp.route('/contacts/<int:contact_id>/delete', methods=['POST'])
@login_required
def delete_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(contact)
    db.session.commit()
    
    flash('Contact deleted successfully!', 'success')
    return redirect(url_for('contacts.contacts'))

# API routes (for React frontend)
@contact_bp.route('/api/contacts', methods=['GET'])
@login_required
def api_get_contacts():
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'contacts': [
            {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email,
                'phone': contact.phone,
                'company': contact.company,
                'address': contact.address,
                'notes': contact.notes,
                'created_at': contact.created_at.isoformat(),
                'updated_at': contact.updated_at.isoformat()
            } for contact in contacts
        ]
    }), 200

@contact_bp.route('/api/contacts', methods=['POST'])
@login_required
def api_create_contact():
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
        
    new_contact = Contact(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        company=data.get('company'),
        address=data.get('address'),
        notes=data.get('notes'),
        user_id=current_user.id
    )
    
    db.session.add(new_contact)
    db.session.commit()
    
    return jsonify({
        'message': 'Contact created successfully',
        'contact': {
            'id': new_contact.id,
            'name': new_contact.name,
            'email': new_contact.email,
            'phone': new_contact.phone,
            'company': new_contact.company,
            'address': new_contact.address,
            'notes': new_contact.notes,
            'created_at': new_contact.created_at.isoformat(),
            'updated_at': new_contact.updated_at.isoformat()
        }
    }), 201

@contact_bp.route('/api/contacts/<int:contact_id>', methods=['GET'])
@login_required
def api_get_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    
    return jsonify({
        'contact': {
            'id': contact.id,
            'name': contact.name,
            'email': contact.email,
            'phone': contact.phone,
            'company': contact.company,
            'address': contact.address,
            'notes': contact.notes,
            'created_at': contact.created_at.isoformat(),
            'updated_at': contact.updated_at.isoformat()
        }
    }), 200

@contact_bp.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@login_required
def api_update_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    if 'name' in data:
        contact.name = data['name']
    if 'email' in data:
        contact.email = data['email']
    if 'phone' in data:
        contact.phone = data['phone']
    if 'company' in data:
        contact.company = data['company']
    if 'address' in data:
        contact.address = data['address']
    if 'notes' in data:
        contact.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Contact updated successfully',
        'contact': {
            'id': contact.id,
            'name': contact.name,
            'email': contact.email,
            'phone': contact.phone,
            'company': contact.company,
            'address': contact.address,
            'notes': contact.notes,
            'created_at': contact.created_at.isoformat(),
            'updated_at': contact.updated_at.isoformat()
        }
    }), 200

@contact_bp.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@login_required
def api_delete_contact(contact_id):
    contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({
        'message': 'Contact deleted successfully'
    }), 200
