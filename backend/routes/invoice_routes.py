from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, Invoice, Contact, Order
from datetime import datetime, timedelta

invoice_bp = Blueprint('invoices', __name__)

# Web routes (Jinja2 templates)
@invoice_bp.route('/invoices')
@login_required
def invoices():
    user_invoices = Invoice.query.filter_by(user_id=current_user.id).all()
    return render_template('invoices.html', invoices=user_invoices)

@invoice_bp.route('/invoices/add', methods=['GET', 'POST'])
@login_required
def add_invoice():
    # Get all contacts and orders for the current user for dropdown selection
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    orders = Order.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        amount = request.form.get('amount')
        status = request.form.get('status')
        due_date = request.form.get('due_date')
        notes = request.form.get('notes')
        contact_id = request.form.get('contact_id')
        order_id = request.form.get('order_id')
        
        if not amount:
            flash('Amount is required!', 'danger')
            return redirect(url_for('invoices.add_invoice'))
        
        if not due_date:
            flash('Due date is required!', 'danger')
            return redirect(url_for('invoices.add_invoice'))
        
        if not contact_id:
            flash('Contact is required!', 'danger')
            return redirect(url_for('invoices.add_invoice'))
            
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('invoices.add_invoice'))
            
        # Validate that order belongs to user (if provided)
        if order_id:
            order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
            if not order:
                flash('Invalid order!', 'danger')
                return redirect(url_for('invoices.add_invoice'))
        
        # Convert date string to datetime object
        due_date_obj = datetime.strptime(due_date, '%Y-%m-%d')
        
        new_invoice = Invoice(
            amount=float(amount),
            status=status or 'Unpaid',
            due_date=due_date_obj,
            notes=notes,
            user_id=current_user.id,
            contact_id=contact_id,
            order_id=order_id if order_id else None
        )
        
        db.session.add(new_invoice)
        db.session.commit()
        
        flash('Invoice added successfully!', 'success')
        return redirect(url_for('invoices.invoices'))
        
    return render_template('add_invoice.html', contacts=contacts, orders=orders)

@invoice_bp.route('/invoices/<int:invoice_id>')
@login_required
def view_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    return render_template('view_invoice.html', invoice=invoice)

@invoice_bp.route('/invoices/<int:invoice_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    orders = Order.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        invoice.amount = float(request.form.get('amount'))
        invoice.status = request.form.get('status')
        invoice.notes = request.form.get('notes')
        
        # Convert date string to datetime object
        due_date = request.form.get('due_date')
        invoice.due_date = datetime.strptime(due_date, '%Y-%m-%d')
        
        contact_id = request.form.get('contact_id')
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, user_id=current_user.id).first()
        if not contact:
            flash('Invalid contact!', 'danger')
            return redirect(url_for('invoices.edit_invoice', invoice_id=invoice.id))
            
        invoice.contact_id = contact_id
        
        # Update order_id if provided
        order_id = request.form.get('order_id')
        if order_id:
            # Validate that order belongs to user
            order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
            if not order:
                flash('Invalid order!', 'danger')
                return redirect(url_for('invoices.edit_invoice', invoice_id=invoice.id))
            invoice.order_id = order_id
        else:
            invoice.order_id = None
        
        db.session.commit()
        
        flash('Invoice updated successfully!', 'success')
        return redirect(url_for('invoices.view_invoice', invoice_id=invoice.id))
        
    return render_template('edit_invoice.html', invoice=invoice, contacts=contacts, orders=orders)

@invoice_bp.route('/invoices/<int:invoice_id>/delete', methods=['POST'])
@login_required
def delete_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(invoice)
    db.session.commit()
    
    flash('Invoice deleted successfully!', 'success')
    return redirect(url_for('invoices.invoices'))

# API routes (for React frontend)
@invoice_bp.route('/api/invoices', methods=['GET'])
@login_required
def api_get_invoices():
    invoices = Invoice.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'invoices': [
            {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount': invoice.amount,
                'status': invoice.status,
                'due_date': invoice.due_date.isoformat(),
                'notes': invoice.notes,
                'created_at': invoice.created_at.isoformat(),
                'updated_at': invoice.updated_at.isoformat(),
                'contact': {
                    'id': invoice.contact.id,
                    'name': invoice.contact.name,
                    'email': invoice.contact.email
                },
                'order': {
                    'id': invoice.order.id,
                    'order_number': invoice.order.order_number
                } if invoice.order else None
            } for invoice in invoices
        ]
    }), 200

@invoice_bp.route('/api/invoices', methods=['POST'])
@login_required
def api_create_invoice():
    data = request.get_json()
    
    if not data or not data.get('amount') or not data.get('due_date') or not data.get('contact_id'):
        return jsonify({'error': 'Amount, due date, and contact_id are required'}), 400
        
    # Validate that contact belongs to user
    contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
    if not contact:
        return jsonify({'error': 'Invalid contact'}), 400
    
    # Validate that order belongs to user (if provided)
    order = None
    if data.get('order_id'):
        order = Order.query.filter_by(id=data['order_id'], user_id=current_user.id).first()
        if not order:
            return jsonify({'error': 'Invalid order'}), 400
    
    # Parse due_date
    try:
        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid due date format. Use ISO format.'}), 400
    
    new_invoice = Invoice(
        amount=float(data['amount']),
        status=data.get('status', 'Unpaid'),
        due_date=due_date,
        notes=data.get('notes'),
        user_id=current_user.id,
        contact_id=data['contact_id'],
        order_id=data.get('order_id')
    )
    
    db.session.add(new_invoice)
    db.session.commit()
    
    return jsonify({
        'message': 'Invoice created successfully',
        'invoice': {
            'id': new_invoice.id,
            'invoice_number': new_invoice.invoice_number,
            'amount': new_invoice.amount,
            'status': new_invoice.status,
            'due_date': new_invoice.due_date.isoformat(),
            'notes': new_invoice.notes,
            'created_at': new_invoice.created_at.isoformat(),
            'updated_at': new_invoice.updated_at.isoformat(),
            'contact': {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email
            },
            'order': {
                'id': order.id,
                'order_number': order.order_number
            } if order else None
        }
    }), 201

@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['GET'])
@login_required
def api_get_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    
    return jsonify({
        'invoice': {
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'amount': invoice.amount,
            'status': invoice.status,
            'due_date': invoice.due_date.isoformat(),
            'notes': invoice.notes,
            'created_at': invoice.created_at.isoformat(),
            'updated_at': invoice.updated_at.isoformat(),
            'contact': {
                'id': invoice.contact.id,
                'name': invoice.contact.name,
                'email': invoice.contact.email
            },
            'order': {
                'id': invoice.order.id,
                'order_number': invoice.order.order_number
            } if invoice.order else None,
            'receipts': [
                {
                    'id': receipt.id,
                    'receipt_number': receipt.receipt_number,
                    'amount': receipt.amount,
                    'payment_method': receipt.payment_method,
                    'created_at': receipt.created_at.isoformat()
                } for receipt in invoice.receipts
            ]
        }
    }), 200

@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
@login_required
def api_update_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    if 'amount' in data:
        invoice.amount = float(data['amount'])
    if 'status' in data:
        invoice.status = data['status']
    if 'notes' in data:
        invoice.notes = data['notes']
    if 'due_date' in data:
        try:
            invoice.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format. Use ISO format.'}), 400
    
    if 'contact_id' in data:
        # Validate that contact belongs to user
        contact = Contact.query.filter_by(id=data['contact_id'], user_id=current_user.id).first()
        if not contact:
            return jsonify({'error': 'Invalid contact'}), 400
        invoice.contact_id = data['contact_id']
    
    if 'order_id' in data:
        if data['order_id'] is None:
            invoice.order_id = None
        else:
            # Validate that order belongs to user
            order = Order.query.filter_by(id=data['order_id'], user_id=current_user.id).first()
            if not order:
                return jsonify({'error': 'Invalid order'}), 400
            invoice.order_id = data['order_id']
    
    db.session.commit()
    
    # Refresh to get updated data
    invoice = Invoice.query.get(invoice_id)
    
    return jsonify({
        'message': 'Invoice updated successfully',
        'invoice': {
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'amount': invoice.amount,
            'status': invoice.status,
            'due_date': invoice.due_date.isoformat(),
            'notes': invoice.notes,
            'created_at': invoice.created_at.isoformat(),
            'updated_at': invoice.updated_at.isoformat(),
            'contact': {
                'id': invoice.contact.id,
                'name': invoice.contact.name,
                'email': invoice.contact.email
            },
            'order': {
                'id': invoice.order.id,
                'order_number': invoice.order.order_number
            } if invoice.order else None
        }
    }), 200

@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
@login_required
def api_delete_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(invoice)
    db.session.commit()
    
    return jsonify({
        'message': 'Invoice deleted successfully'
    }), 200
