from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, Lead, Contact

lead_bp = Blueprint('leads', __name__)

# Web routes (Jinja2 templates)
@lead_bp.route('/leads')
@login_required
def leads():
    user_leads = Lead.query.filter_by(user_id=current_user.id).all()
    return render_template('leads.html', leads=user_leads)

@lead_bp.route('/leads/add', methods=['GET', 'POST'])
@login_required
def add_lead():
    # Get all contacts for the current user for dropdown selection
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        title = request.form.get('title')
        status = request.form.get('status')
        value = request.form.get('value')
        notes = request.form.get('notes')
        contact_id = request.form.get('contact_id')
        
        if not title:
            flash('Title is required!', 'danger')
            return redirect(url_for('leads.add_lead'))
        
        if not contact_id:
            flash('Contact is required!', 'danger')
            return redirect(url_for('leads.add_lead'))
            
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('leads.add_lead'))
            
        new_lead = Lead(
            title=title,
            status=status or 'New',
            value=value,
            notes=notes,
            user_id=current_user.id,
            contact_id=contact_id
        )
        
        db.session.add(new_lead)
        db.session.commit()
        
        flash('Lead added successfully!', 'success')
        return redirect(url_for('leads.leads'))
        
    return render_template('add_lead.html', contacts=contacts)

@lead_bp.route('/leads/<int:lead_id>')
@login_required
def view_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    return render_template('view_lead.html', lead=lead)

@lead_bp.route('/leads/<int:lead_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        lead.title = request.form.get('title')
        lead.status = request.form.get('status')
        lead.value = request.form.get('value')
        lead.notes = request.form.get('notes')
        
        contact_id = request.form.get('contact_id')
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('leads.edit_lead', lead_id=lead.id))
            
        lead.contact_id = contact_id
        
        db.session.commit()
        
        flash('Lead updated successfully!', 'success')
        return redirect(url_for('leads.view_lead', lead_id=lead.id))
        
    return render_template('edit_lead.html', lead=lead, contacts=contacts)

@lead_bp.route('/leads/<int:lead_id>/delete', methods=['POST'])
@login_required
def delete_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(lead)
    db.session.commit()
    
    flash('Lead deleted successfully!', 'success')
    return redirect(url_for('leads.leads'))

# API routes (for React frontend)
@lead_bp.route('/api/leads', methods=['GET'])
@login_required
def api_get_leads():
    leads = Lead.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'leads': [
            {
                'id': lead.id,
                'title': lead.title,
                'status': lead.status,
                'value': lead.value,
                'notes': lead.notes,
                'created_at': lead.created_at.isoformat(),
                'updated_at': lead.updated_at.isoformat(),
                'contact': {
                    'id': lead.contact.id,
                    'name': lead.contact.name,
                    'email': lead.contact.email
                }
            } for lead in leads
        ]
    }), 200

@lead_bp.route('/api/leads', methods=['POST'])
@login_required
def api_create_lead():
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('contact_id'):
        return jsonify({'error': 'Title and contact_id are required'}), 400
        
    # Validate that contact belongs to user
    contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
    if not contact:
        return jsonify({'error': 'Invalid contact'}), 400
        
    new_lead = Lead(
        title=data['title'],
        status=data.get('status', 'New'),
        value=data.get('value'),
        notes=data.get('notes'),
        user_id=current_user.id,
        contact_id=data['contact_id']
    )
    
    db.session.add(new_lead)
    db.session.commit()
    
    return jsonify({
        'message': 'Lead created successfully',
        'lead': {
            'id': new_lead.id,
            'title': new_lead.title,
            'status': new_lead.status,
            'value': new_lead.value,
            'notes': new_lead.notes,
            'created_at': new_lead.created_at.isoformat(),
            'updated_at': new_lead.updated_at.isoformat(),
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email
            }
        }
    }), 201

@lead_bp.route('/api/leads/<int:lead_id>', methods=['GET'])
@login_required
def api_get_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    contact = lead.contact
    
    return jsonify({
        'lead': {
            'id': lead.id,
            'title': lead.title,
            'status': lead.status,
            'value': lead.value,
            'notes': lead.notes,
            'created_at': lead.created_at.isoformat(),
            'updated_at': lead.updated_at.isoformat(),
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email
            }
        }
    }), 200

@lead_bp.route('/api/leads/<int:lead_id>', methods=['PUT'])
@login_required
def api_update_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    if 'title' in data:
        lead.title = data['title']
    if 'status' in data:
        lead.status = data['status']
    if 'value' in data:
        lead.value = data['value']
    if 'notes' in data:
        lead.notes = data['notes']
    if 'contact_id' in data:
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
        if not contact:
            return jsonify({'error': 'Invalid contact'}), 400
        lead.contact_id = data['contact_id']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Lead updated successfully',
        'lead': {
            'id': lead.id,
            'title': lead.title,
            'status': lead.status,
            'value': lead.value,
            'notes': lead.notes,
            'created_at': lead.created_at.isoformat(),
            'updated_at': lead.updated_at.isoformat(),
            'contact': {
                'id': lead.contact.id,
                'name': lead.contact.name,
                'email': lead.contact.email
            }
        }
    }), 200

@lead_bp.route('/api/leads/<int:lead_id>', methods=['DELETE'])
@login_required
def api_delete_lead(lead_id):
    lead = Lead.query.filter_by(id=lead_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(lead)
    db.session.commit()
    
    return jsonify({
        'message': 'Lead deleted successfully'
    }), 200
